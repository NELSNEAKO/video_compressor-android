package com.videocompressor.app;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import androidx.annotation.OptIn;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.Presentation;
import androidx.media3.transformer.Composition;
import androidx.media3.transformer.DefaultEncoderFactory;
import androidx.media3.transformer.EditedMediaItem;
import androidx.media3.transformer.Effects;
import androidx.media3.transformer.ExportException;
import androidx.media3.transformer.ExportResult;
import androidx.media3.transformer.ProgressHolder;
import androidx.media3.transformer.Transformer;
import androidx.media3.transformer.VideoEncoderSettings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;
import java.util.UUID;

@CapacitorPlugin(name = "VideoReencoder")
public class VideoReencoderPlugin extends Plugin {

    private static final int DEFAULT_BITRATE = 1_000_000;
    private static final int COPY_BUFFER_SIZE = 8192;

    @PluginMethod
    public void reencodeVideo(PluginCall call) {
        final String inputPath = call.getString("inputPath");
        final String outputPath = call.getString("outputPath");
        final Integer width = call.getInt("width");
        final Integer height = call.getInt("height");
        final Integer bitrateValue = call.getInt("bitrate");

        if (inputPath == null || inputPath.isEmpty()) {
            call.reject("inputPath is required");
            return;
        }
        if (outputPath == null || outputPath.isEmpty()) {
            call.reject("outputPath is required");
            return;
        }

        final File inputFile = toFile(inputPath);
        final File outputFile = toFile(outputPath);
        final int bitrate = bitrateValue == null || bitrateValue <= 0 ? DEFAULT_BITRATE : bitrateValue;
        // 0 = keep original resolution; only lower bitrate / file size
        final int targetWidth = width == null || width <= 0 ? 0 : width;
        final int targetHeight = height == null || height <= 0 ? 0 : height;
        final String jobId = UUID.randomUUID().toString();

        if (!inputFile.isFile()) {
            call.reject("Input video was not found: " + inputFile.getAbsolutePath());
            return;
        }

        final File outputDirectory = outputFile.getParentFile();
        if (outputDirectory != null && !outputDirectory.exists() && !outputDirectory.mkdirs()) {
            call.reject("Could not create output directory");
            return;
        }

        if (outputFile.exists() && !outputFile.delete()) {
            call.reject("Could not clear existing output file");
            return;
        }

        final JSObject accepted = new JSObject();
        accepted.put("jobId", jobId);
        accepted.put("status", "queued");
        call.resolve(accepted);

        startTransform(jobId, inputFile, outputFile, targetWidth, targetHeight, bitrate);
    }

    @PluginMethod
    public void pickSaveLocation(PluginCall call) {
        String suggestedName = call.getString("suggestedName", "compressed-video.mp4");
        if (suggestedName == null || suggestedName.trim().isEmpty()) {
            suggestedName = "compressed-video.mp4";
        }

        final Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("video/mp4");
        intent.putExtra(Intent.EXTRA_TITLE, suggestedName);

        startActivityForResult(call, intent, "pickSaveLocationResult");
    }

    @ActivityCallback
    private void pickSaveLocationResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("cancelled");
            return;
        }

        final Uri uri = result.getData().getData();
        if (uri == null) {
            call.reject("cancelled");
            return;
        }

        final JSObject ret = new JSObject();
        ret.put("uri", uri.toString());
        ret.put("displayName", queryDisplayName(uri));
        call.resolve(ret);
    }

    @PluginMethod
    public void copyFileToUri(PluginCall call) {
        final String sourcePath = call.getString("sourcePath");
        final String destinationUri = call.getString("destinationUri");

        if (sourcePath == null || sourcePath.isEmpty()) {
            call.reject("sourcePath is required");
            return;
        }
        if (destinationUri == null || destinationUri.isEmpty()) {
            call.reject("destinationUri is required");
            return;
        }

        final File sourceFile = toFile(sourcePath);
        if (!sourceFile.isFile()) {
            call.reject("Compressed video was not found");
            return;
        }

        final Uri destUri = Uri.parse(destinationUri);

        try (
            final InputStream input = new FileInputStream(sourceFile);
            final OutputStream output = getContext().getContentResolver().openOutputStream(destUri)
        ) {
            if (output == null) {
                call.reject("Could not open the save location");
                return;
            }

            final byte[] buffer = new byte[COPY_BUFFER_SIZE];
            int read;
            while ((read = input.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            output.flush();
        } catch (final Exception exception) {
            call.reject(
                exception.getMessage() != null ? exception.getMessage() : "Could not save the video",
                exception
            );
            return;
        }

        final JSObject ret = new JSObject();
        ret.put("uri", destinationUri);
        ret.put("displayName", queryDisplayName(destUri));
        call.resolve(ret);
    }

    @OptIn(markerClass = UnstableApi.class)
    private void startTransform(
        final String jobId,
        final File inputFile,
        final File outputFile,
        final int width,
        final int height,
        final int bitrate
    ) {
        final Handler mainHandler = new Handler(Looper.getMainLooper());

        mainHandler.post(() -> {
            try {
                final EditedMediaItem.Builder editedBuilder = new EditedMediaItem.Builder(
                    MediaItem.fromUri(Uri.fromFile(inputFile))
                );

                // Only scale when both dimensions are set. Otherwise keep original size.
                if (width > 0 && height > 0) {
                    final Presentation presentation = Presentation.createForWidthAndHeight(
                        width,
                        height,
                        Presentation.LAYOUT_SCALE_TO_FIT
                    );
                    editedBuilder.setEffects(
                        new Effects(Collections.emptyList(), Collections.singletonList(presentation))
                    );
                }

                final EditedMediaItem editedMediaItem = editedBuilder.build();

                final DefaultEncoderFactory encoderFactory = new DefaultEncoderFactory.Builder(getContext())
                    .setRequestedVideoEncoderSettings(
                        new VideoEncoderSettings.Builder().setBitrate(bitrate).build()
                    )
                    .build();

                final ProgressHolder progressHolder = new ProgressHolder();
                final Runnable[] progressPoller = new Runnable[1];

                final Transformer transformer = new Transformer.Builder(getContext())
                    .setVideoMimeType(MimeTypes.VIDEO_H264)
                    .setEncoderFactory(encoderFactory)
                    .addListener(
                        new Transformer.Listener() {
                            @Override
                            public void onCompleted(final Composition composition, final ExportResult exportResult) {
                                if (progressPoller[0] != null) {
                                    mainHandler.removeCallbacks(progressPoller[0]);
                                }
                                emitProgress(jobId, 1.0, "completed", "Re-encoding completed.", outputFile);
                            }

                            @Override
                            public void onError(
                                final Composition composition,
                                final ExportResult exportResult,
                                final ExportException exportException
                            ) {
                                if (progressPoller[0] != null) {
                                    mainHandler.removeCallbacks(progressPoller[0]);
                                }
                                final String message = exportException.getMessage() != null
                                    ? exportException.getMessage()
                                    : "Could not re-encode the input video.";
                                emitProgress(jobId, 0.0, "failed", message, null);
                            }
                        }
                    )
                    .build();

                progressPoller[0] = new Runnable() {
                    @Override
                    public void run() {
                        final int progressState = transformer.getProgress(progressHolder);
                        if (progressState == Transformer.PROGRESS_STATE_AVAILABLE) {
                            final double normalized = Math.min(0.99, Math.max(0.0, progressHolder.progress / 100.0));
                            emitProgress(jobId, normalized, "running", "Re-encoding video...", null);
                        }
                        mainHandler.postDelayed(this, 200);
                    }
                };

                emitProgress(jobId, 0.0, "running", "Re-encoding video...", null);
                mainHandler.post(progressPoller[0]);
                transformer.start(editedMediaItem, outputFile.getAbsolutePath());
            } catch (final Exception exception) {
                final String message = exception.getMessage() != null
                    ? exception.getMessage()
                    : "Could not start video re-encoding.";
                emitProgress(jobId, 0.0, "failed", message, null);
            }
        });
    }

    private String queryDisplayName(final Uri uri) {
        try (
            final Cursor cursor = getContext()
                .getContentResolver()
                .query(uri, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)
        ) {
            if (cursor != null && cursor.moveToFirst()) {
                final int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (index >= 0) {
                    final String name = cursor.getString(index);
                    if (name != null && !name.isEmpty()) {
                        return name;
                    }
                }
            }
        } catch (final Exception ignored) {
            // Fall through to URI path segment.
        }

        final String lastSegment = uri.getLastPathSegment();
        return lastSegment != null ? lastSegment : "compressed-video.mp4";
    }

    private void emitProgress(
        final String jobId,
        final double progress,
        final String state,
        final String message,
        final File outputFile
    ) {
        final JSObject event = new JSObject();
        event.put("jobId", jobId);
        event.put("progress", progress);
        event.put("state", state);
        event.put("message", message);
        if (outputFile != null) {
            event.put("outputPath", outputFile.getAbsolutePath());
            event.put("outputSize", outputFile.length());
        }
        notifyListeners("progress", event);
    }

    private static File toFile(final String pathOrUri) {
        if (pathOrUri.startsWith("file://")) {
            return new File(Uri.parse(pathOrUri).getPath());
        }
        return new File(pathOrUri);
    }
}

package com.videocompressor.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VideoReencoderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

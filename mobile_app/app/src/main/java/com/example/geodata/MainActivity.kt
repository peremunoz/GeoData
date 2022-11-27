package com.example.geodata

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : AppCompatActivity() {

    private val viewModel: MainModel = MainModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen().apply {
            setKeepOnScreenCondition {
                viewModel.isLoading.value
            }
        }
        /**onCreate és el mètode que s'executa quan s'obre l'aplicació**/
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val myWebView: WebView = findViewById(R.id.webView)
        myWebView.webViewClient = WebViewClient()

        var settings = myWebView.getSettings()
        settings.javaScriptEnabled = true
        myWebView.loadUrl("http://192.168.43.235:5173")
    }
}
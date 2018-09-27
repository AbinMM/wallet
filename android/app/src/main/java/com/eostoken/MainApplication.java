package com.eostoken;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.theweflex.react.WeChatPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.lenny.modules.upgrade.UpgradeReactPackage;
import com.tradle.react.UdpSocketsModule;
import com.peel.react.TcpSocketsModule;
import com.horcrux.svg.SvgPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.reactnativecomponent.barcode.RCTCapturePackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.peel.react.rnos.RNOSModule;
import com.BV.LinearGradient.LinearGradientPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cn.jpush.reactnativejpush.JPushPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.lenny.modules.upgrade.UpgradeReactPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cn.jpush.reactnativejpush.JPushPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.microsoft.codepush.react.CodePush;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.microsoft.codepush.react.CodePush;
import java.util.Arrays;
import java.util.List;
import com.lenny.modules.upgrade.UpgradeReactPackage;
import com.eostoken.umeng.DplusReactPackage;
import com.eostoken.umeng.RNUMConfigure;
import com.theweflex.react.WeChatPackage;
import com.umeng.commonsdk.UMConfigure;
import com.reactnativecomponent.barcode.RCTCapturePackage;
import com.eostoken.opensettings.*; 
import com.eostoken.sdk.*; 
public class MainApplication extends Application implements ReactApplication {

    private ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
            new WeChatPackage(),
            new RNViewShotPackage(),
            new VectorIconsPackage(),
            new UpgradeReactPackage(),
            new UdpSocketsModule(),
            new TcpSocketsModule(),
            new SvgPackage(),
            new SplashScreenReactPackage(),
            new RCTCapturePackage(),
            new RandomBytesPackage(),
            new RNOSModule(),
            new LinearGradientPackage(),
            new RNGestureHandlerPackage(),
            new RNDeviceInfo(),
            new JPushPackage(!BuildConfig.DEBUG, !BuildConfig.DEBUG),
            new LinearGradientPackage(),
            new OpenSettingsPackage(), /* setting add */
                    new DplusReactPackage(),
                    new SDKPackage(),
                    new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG)
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        RNUMConfigure.init(this, "5abddfbab27b0a2e67000060", "Umeng", UMConfigure.DEVICE_TYPE_PHONE,"");
    }

}

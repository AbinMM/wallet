package com.eostoken.sdk;

import android.app.Activity;
import android.net.Uri;
import android.text.TextUtils;
import android.webkit.WebView;

import org.json.JSONObject;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;

/**统一管理 java层暴露给js的类和方法，并且能实时添加
 *
 * javaClass就是满足某种规范的类，该类中有满足规范的方法，我们规定这个类需要实现一个空接口，
 * 为什么呢?主要作用就混淆的时候不会发生错误，
 * 还有一个作用就是约束JSBridge.register方法第二个参数必须是该接口的实现类。
 * @author lizhangqu
 * @since 2016-02-27 22:08
 */
public class JSBridge {
    public static Activity mActivity;
    private static final Map<String, HashMap<String, Method>> exposedMethods = new HashMap<>();

    public static void register(Activity activity,String exposedName, Class<? extends IBridge> clazz) {
        if (!exposedMethods.containsKey(exposedName)) {
            try {
                mActivity = activity;
                exposedMethods.put(exposedName, getAllMethod(clazz));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private static HashMap<String, Method> getAllMethod(Class injectedCls) throws Exception {
        HashMap<String, Method> mMethodsMap = new HashMap<>();
        Method[] methods = injectedCls.getDeclaredMethods();
        for (Method method : methods) {
            String name;
            if (method.getModifiers() != (Modifier.PUBLIC | Modifier.STATIC) || (name = method.getName()) == null) {
                continue;
            }
            Class[] parameters = method.getParameterTypes();
            if (null != parameters && parameters.length == 3) {
                if (parameters[0] == WebView.class && parameters[1] == JSONObject.class && parameters[2] == Callback.class) {
                    mMethodsMap.put(name, method);
                }
            }
        }
        return mMethodsMap;
    }


    public static String callJava(WebView webView, String uriString) {
        String methodName = "";
        String className = "";
        String param = "{}";
        String port = "";
        if (!TextUtils.isEmpty(uriString) && uriString.startsWith("JSBridge")) {
            Uri uri = Uri.parse(uriString);
            className = uri.getHost();
            param = uri.getQuery();
            port = uri.getPort() + "";
            System.out.println("JS层调java层port = "+port);
            String path = uri.getPath();
            if (!TextUtils.isEmpty(path)) {
                methodName = path.replace("/", "");
            }
        }
        if (exposedMethods.containsKey(className)) {
            HashMap<String, Method> methodHashMap = exposedMethods.get(className);

            if (methodHashMap != null && methodHashMap.size() != 0 && methodHashMap.containsKey(methodName)) {
                Method method = methodHashMap.get(methodName);
                if (method != null) {
                    try {
                        Callback callback = new Callback(webView, port);
                        method.invoke(null, webView, new JSONObject(param),callback);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        return null;
    }
}
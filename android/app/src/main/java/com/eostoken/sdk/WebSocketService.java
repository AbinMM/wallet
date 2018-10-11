package com.eostoken.sdk;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Collection;
import org.json.JSONException;
import org.json.JSONArray;
import org.json.JSONObject;

import com.eostoken.MainActivity;

/***
 *  WebSocket 
 */

public class WebSocketService extends WebSocketServer {

    public WebSocketService(int port) throws UnknownHostException {
        super(new InetSocketAddress(port));
    }

    public WebSocketService(InetSocketAddress address) {
        super(address);
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {

        String message = "40/scatter";
        sendToAll(message);
        // MainActivity.Test("WebSocketService onOpen:" + message);//debug
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        // String address = webSocket.getRemoteSocketAddress().getAddress().getHostAddress();
        // String message = String.format("(%s) <退出房间！>", address);
        // sendToAll(message);

        // MainActivity.Test("WebSocketService onClose");//debug
    }

    @Override
    public void onMessage(WebSocket webSocket, String msg) {
        //服务端接收到消息
        
        String str_Prefix = "42/scatter,";
        int index = msg.indexOf(str_Prefix);
        if(index >= 0)
        {
            // MainActivity.Test("WebSocketService onMessage:" + msg);//debug
            String str_data = msg.substring(index + str_Prefix.length(), msg.length());

            String event_pair = "pair";
            String event_api = "api";
            String event_rekey = "rekey";

            int pairIndex = str_data.indexOf(event_pair);
            int apiIndex = str_data.indexOf(event_api);
            int rekeyIndex = str_data.indexOf(event_rekey);
            if(pairIndex >= 0)
            {
                String str_json =  str_data.substring(pairIndex + event_pair.length() + 2, str_data.length()-1);
                // MainActivity.Test("WebSocketService pair str_json:" + str_json);//debug
                callbakcToWebview(event_pair,str_json);
            }
            else if(apiIndex >= 0)
            {
                String str_json =  str_data.substring(apiIndex + event_api.length() + 2, str_data.length()-1);
                // MainActivity.Test("WebSocketService api str_json:" + str_json);//debug
                try {
                    String plugin = "";
                    String type = "";

                    JSONObject jsonobj = new JSONObject(str_json);
                    plugin = jsonobj.getString("plugin");
                    String data = jsonobj.getString("data");

                    JSONObject data_obj = new JSONObject(data);
                    type = data_obj.getString("type");

                    callMessage(type,plugin,data_obj);
                } catch (Exception e) {
                    //TODO: handle exception
                }
            }
            else if(rekeyIndex >= 0)
            {
                String str_json =  str_data.substring(rekeyIndex + event_rekey.length() + 2, str_data.length()-1);
                // MainActivity.Test("WebSocketService pair str_json:" + str_json);//debug
                callbakcToWebview(event_rekey,str_json);
            }
        }
    }

    private void callbakcToWebview(final String event,final String retJson)
    {
       if(!event.isEmpty() && !retJson.isEmpty())
       {
            String retEvent = event;
            if(event.equals("pair"))
            {
               retEvent = "paired";
            }

            StringBuffer sb = new StringBuffer();
            sb.append("[");
            sb.append("\"");
            sb.append(retEvent);
            sb.append("\"");
            sb.append(",");
            sb.append(retJson);
            sb.append("]");
        
            sendToAll("42/scatter," + sb.toString());
       }
   }

    private void callMessage(final String type,final String plugin,final JSONObject data_obj) 
    {
        switch(type){
            case "identityFromPermissions":
                identityFromPermissions(type,plugin,data_obj);
                break;

            case "getOrRequestIdentity":
                getOrRequestIdentity(type,plugin,data_obj);
                break;

            case "requestSignature":
                requestSignature(type,plugin,data_obj);
                break;

            default:
                break;
        }
    }

    private static void print(String msg) {
        System.out.println(String.format("[%d] %s", System.currentTimeMillis(), msg));
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        if (null != webSocket) {
            webSocket.close(0);
        }
        e.printStackTrace();

        // MainActivity.Test("WebSocketService onError:" +  e.getMessage());//debug
    }

    public void sendToAll(String message) {

        // MainActivity.Test("WebSocketService sendToAll:" + message);//debug
          
        // 获取所有连接的客户端
        Collection<WebSocket> connections = connections();
        //将消息发送给每一个客户端
        for (WebSocket client : connections) {
            client.send(message);
        }
    }

    @Override
	public void onStart() {
		System.out.println("Server started!");
		setConnectionLostTimeout(0);
		setConnectionLostTimeout(100);
    }

    /**
     *  scatter的API
    */
    private void identityFromPermissions(final String type,final String plugin,final JSONObject data_obj)
    {
        String origin = "";
        String resp = "";
        try {
            String payload = data_obj.getString("payload");
            String id =  data_obj.getString("id");

            JSONObject payload_data_obj = new JSONObject(payload);
            origin = payload_data_obj.getString("origin");
    

            JSONObject obj = new JSONObject();
            obj.put("id", id);
            obj.put("type", type);
            obj.put("plugin", plugin);

            JSONObject subobj = new JSONObject();
            subobj.put("origin", origin);
            obj.put("payload", subobj.toString());

            resp = obj.toString();
        } catch (Exception e) {
            resp = "";
        }

        callbakcToWebview("api",resp);
    }
    private void getOrRequestIdentity(final String type,final String plugin,final JSONObject data_obj)
    {
        String resp = "";
        try {
            String payload = data_obj.getString("payload");
            String id =  data_obj.getString("id");

            JSONObject payload_data_obj = new JSONObject(payload);
            String origin = payload_data_obj.getString("origin");

            String fields =  payload_data_obj.getString("fields");
            JSONObject fields_obj = new JSONObject(fields);
            // String personal = fields_obj.getString("personal");
            // String location = fields_obj.getString("location");
            // String accounts = fields_obj.getString("accounts");

            JSONObject obj = new JSONObject();
            obj.put("id", id);
            obj.put("type", type);
            obj.put("plugin", plugin);

            JSONObject subobj = new JSONObject();
            subobj.put("origin", origin);
            obj.put("payload", subobj.toString());

            JSONObject resultobj = new JSONObject();

            JSONObject personal_obj = new JSONObject();
            personal_obj.put("firstname", "Clark");
            personal_obj.put("lastname", "Kent");
            personal_obj.put("email", "superheroes@anonymous.com");
            personal_obj.put("birthdate", "29-3-1938");
            // resultobj.put("personal", personal_obj.toString());
            resultobj.put("personal", personal_obj);

            JSONObject location_obj = new JSONObject();
            location_obj.put("phone", "555-5555");
            location_obj.put("address", "1938 Sullivan Lane");
            location_obj.put("city", "Nowhere");
            location_obj.put("state", "OK");

            JSONObject country_obj = new JSONObject();
            country_obj.put("code", "US");
            country_obj.put("name", "United States");
            // location_obj.put("country", country_obj.toString());
            location_obj.put("country", country_obj);

            location_obj.put("zipcode", "73038");
            // resultobj.put("location", location_obj.toString());
            resultobj.put("location", location_obj);

            JSONObject currentaccount_obj = new JSONObject();
            currentaccount_obj.put("authority", "active");
            currentaccount_obj.put("blockchain", "eos");
            currentaccount_obj.put("name", "eosbille1234");
            currentaccount_obj.put("publicKey", "EOS6tqnNR3AiUVFdX29rYFy6mEasi7whzVQ5wUTe2kcGgQhmY6gum");

            JSONArray jsonArray = new JSONArray();
            jsonArray.put(currentaccount_obj);

            resultobj.put("accounts", jsonArray);
           
            obj.put("result", resultobj);
            resp = obj.toString();
        } catch (Exception e) {
            resp = "";
        }
        callbakcToWebview("api",resp);
    }

    private void requestSignature(final String type,final String plugin,final JSONObject data_obj)
    {
        String resp = "";
        try {
            String payload = data_obj.getString("payload");
            String id =  data_obj.getString("id");

            JSONObject payload_data_obj = new JSONObject(payload);
            String origin = payload_data_obj.getString("origin");

            String transaction =  payload_data_obj.getString("transaction");
            JSONObject transaction_obj = new JSONObject(transaction);
            // String personal = fields_obj.getString("personal");

            JSONObject obj = new JSONObject();
            obj.put("id", id);
            obj.put("type", type);
            obj.put("plugin", plugin);

            JSONObject subobj = new JSONObject();
            subobj.put("origin", origin);
            obj.put("payload", subobj.toString());

            obj.put("result", "111");
            resp = obj.toString();
        } catch (Exception e) {
            resp = "";
        }
        // MainActivity.Test("WebSocketService resp:" + resp);//debug
        callbakcToWebview("api",resp);
    }


}


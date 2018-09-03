an eos wallet



## Build project:<br> 
cd wallet <br> 
npm i <br> 

### fix react-native-smart-barcode build error:<br>
/node_modules/react-native-smart-barcode/Barcode.js<br>

error:<br>
``` javascript
import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    NativeModules,
    AppState,
    Platform,
} from 'react-native'
```

correct:<br>
``` javascript
import React, {
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    NativeModules,
    AppState,
    Platform,
} from 'react-native'
import PropTypes from 'prop-types'
```

### run android:<br>
react-native run-android

### run ios:<br>
在xcode里面点击run

### 环境
npm version:3.10.10 <br>
node version:v6.11.2 <br>
gradle:2.2.3 <br>

### android release版本无法发送请求的问题<br>
将：node_modules\react-native-eosjs\src\eosjs.html文件复制到：android\app\src\main\assets文件夹下面

在 node_module/react-native-eosjs/src/index.js文件的头部添加
```javascript
const iosPlatform = Platform.OS === 'IOS' ? 'true' : 'false';
```
将node_module/react-native-eosjs/src/index.js文件的最后部分修改：
```javascript
render() {
return (<View style={{ flex: 1, height: 0, zIndex: -999999, position: 'absolute' }}>
<WebView ref="eosjs" style={{ height: 0, width: 0, backgroundColor: 'transparent' }}
source={iosPlatform === 'true' ? require('./eosjs.html') : { 'uri': 'file:///android_asset/eosjs.html' }}
// source={require('./eosjs.html')}
onMessage={(e) => { this.onMessage(e) }}
/>);
}
```
微信：tao709308469<br>

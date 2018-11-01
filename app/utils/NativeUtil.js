import {Linking, NativeModules, Platform} from 'react-native';

var NativeUtil = {
  openSystemSetting: function() {
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }
  }
}

module.exports = NativeUtil;
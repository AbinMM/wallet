import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import UColor from '../utils/Colors'
import Constants from '../utils/Constants'
import ScreenUtil from '../utils/ScreenUtil'
import PropTypes from 'prop-types';
import BaseComponent from "../components/BaseComponent";

{/* 示例：
  <PasswordInput password={this.state.password} onCallbackFun={(password) => this.setState({ password })} 
repeatpassword={this.state.repeatpassword} onCallbackFunRepeat={(repeatpassword) => this.setState({ repeatpassword })}/> 
*/}

  class PasswordInput extends BaseComponent {
  constructor(props){
    super(props)
  }

  state = {
    password:"",
    repeatpassword: "",
    weak: false,
    medium: false,
    strong: false,
    statetext: "",
  }

  intensity() {
    let string = this.state.password;
    if(string.length >=7) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.statetext = '很棒';
        this.state.strong = true;
        this.state.medium = true;
        this.state.weak = true;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.statetext = '不错';
          this.state.strong = false;
          this.state.medium = true;
          this.state.weak = true;
        }else{
          this.state.statetext = '还行';
          this.state.strong = false;
          this.state.medium = false;
          this.state.weak = true;
        }
      }
    }else{
      this.state.statetext = "";
      this.state.strong = false;
      this.state.medium = false;
      this.state.weak = false;
    }
   
  }

  
    static propTypes = {

      password: PropTypes.string,
      onCallbackFun: PropTypes.func,

      repeatassword: PropTypes.string,
      onCallbackFunRepeat: PropTypes.func,
    
    }

  render(){

    let {password, onCallbackFun,repeatpassword, onCallbackFunRepeat } = this.props
    return (
        <View>
          <View style={[styles.inptout,{flexDirection: 'row'}]}>
          <Text style={{flex: 1,fontSize: ScreenUtil.setSpText(16),  color: '#323232'}}>设置密码</Text>
          <View style={{flexDirection: 'row',alignItems: 'center'}}>
            <Text style={{fontSize: ScreenUtil.setSpText(10), color: '#3B80F4', paddingHorizontal: ScreenUtil.autowidth(5),}}>{this.state.statetext}</Text>
            <View style={{width: ScreenUtil.autowidth(10), flexDirection: 'column',}}>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.strong ? '#3B80F4' : '#D8D8D8',}}/>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.strong ? '#3B80F4' : '#D8D8D8',}}/>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.medium ? '#3B80F4' : '#D8D8D8',}}/>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.medium ? '#3B80F4' : '#D8D8D8',}}/>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.weak ? '#3B80F4' : '#D8D8D8',}}/>
              <View style={{height: 2,marginVertical: 0.5,backgroundColor: this.state.weak ? '#3B80F4' : '#D8D8D8',}}/>
            </View>
          </View>
        </View>
        <TextInput ref={(ref) => this._lpass = ref} value={password} returnKeyType="next" editable={true}
          selectionColor={UColor.tintColor} style={[styles.inpt,{color: '#808080',borderBottomWidth:0.5, borderBottomColor: '#D5D5D5'}]} 
          onChangeText={(password) => {this.setState({ password });if(onCallbackFun)onCallbackFun(password);}} onChange={this.intensity()} autoFocus={false} placeholderTextColor={'#D9D9D9'} 
          placeholder="输入密码至少8位，建议大小写字母混合" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH} 
          />

        <TextInput ref={(ref) => this._rpass = ref} value={repeatpassword} returnKeyType="next"  
          selectionColor={UColor.tintColor} style={[styles.textinpt,{color: '#808080', borderBottomColor: '#D5D5D5'}]} placeholderTextColor={'#D9D9D9'}
          onChangeText={(repeatpassword) => {this.setState({ repeatpassword });if(onCallbackFunRepeat)onCallbackFunRepeat(repeatpassword); }}  onChange={this.intensity()} autoFocus={false}
          placeholder="重复输入密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
          />
      </View>
    )
  }
}


const styles = StyleSheet.create({
  inptout: {
    marginVertical: ScreenUtil.autowidth(20),
  },
  inpt: {
    paddingVertical: 0,
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
  },
  textinpt: {
    paddingVertical: 0,
    borderBottomWidth:0.5,
    fontSize: ScreenUtil.setSpText(14),
    paddingLeft: ScreenUtil.autowidth(2),
    paddingTop: ScreenUtil.autowidth(24), 
  },

});


export default PasswordInput;
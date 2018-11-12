import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, ListView } from 'react-native';
import UColor from '../../utils/Colors'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import {AlertModal,} from '../../components/modals/AlertModal'

var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;

let pageNo = 1;

@connect(({ dapp }) => ({ ...dapp }))
class DappAllList extends BaseComponent {

  static navigationOptions = {
    title: '',
    header:null, 
  };
  
  constructor(props) {
    super(props);
    this.state = {
      id:this.props.navigation.state.params.id ? this.props.navigation.state.params.id : "",
      name:this.props.navigation.state.params.name ? this.props.navigation.state.params.name : "",
      dappList: [],           
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };
  }

  //组件加载完成
  componentDidMount() {
      pageNo=1;
      this.loadDappList(pageNo);

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  loadDappList = (page) =>{

    this.props.dispatch({ type: 'dapp/dappfindAllByType', payload: {tid:this.state.id,page:page,pageSize:20}, 
    callback: (resp) => {
      if(resp && resp.code == '0'){
        if(resp.data && resp.data.length > 0){
           if(page == 1)
           {  
            this.setState({ dappList: resp.data});
           }else{
            let old = this.state.dappList;
            let news = old.concat(resp.data);
            this.setState({ dappList: news});
           }
        }
      }
    }  
  });

  }

    //加载更多
    onEndReached () {
      pageNo = pageNo+1;
      this.loadDappList(pageNo);
    };
  
    //下拉刷新
    onRefresh () {
      pageNo=1;
      this.loadDappList(pageNo);
    };

  //点DAPP跳转
  onPressDapp(data) {
    const { navigate } = this.props.navigation;
    var title = '您所访问的页面将跳至第三方DApp' + data.name;
    var content = '提示：您所访问的页面将跳转至第三方DApp'+ data.name +'。您在第三方DApp上的使用行为将适用该第三方DApp的用户协议和隐私政策，由其直接并单独向您承担责任。';
    AlertModal.show(title,content,'确认','取消',(resp)=>{
      if(resp){
          navigate('DappWeb', { data: data});
        }
    });
  }

  render() {
    return (
      <View style={[styles.container,{backgroundColor: '#FAFAF9'}]}>
        <Header {...this.props} onPressLeft={true} title= {this.state.name}/>
        <ScrollView  keyboardShouldPersistTaps="always" style={{flex: 1,}}>
        <View style={{flex: 1,}}>
         <ListView initialListSize={10} enableEmptySections = {true} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-start',paddingHorizontal: ScreenUtil.autowidth(12.5)}}
              onEndReachedThreshold={20}   onEndReached={() => this.onEndReached()}
            //   refreshControl={<RefreshControl refreshing={this.props.newsRefresh} onRefresh={() => this.onRefresh()}
            // tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}/>}
              dataSource={this.state.dataSource.cloneWithRows(this.state.dappList == null ? [] : this.state.dappList)}
              renderRow={(rowData) => (

                <TouchableOpacity  onPress={this.onPressDapp.bind(this, rowData)}  style={{width: (ScreenWidth - ScreenUtil.autowidth(25))/2, paddingHorizontal: ScreenUtil.autowidth(7.5),paddingTop: ScreenUtil.autoheight(15),}}>
                  <View style={{ flexDirection: 'row',alignItems: 'center', justifyContent: "center", backgroundColor: '#FFFFFF',paddingHorizontal:ScreenUtil.autowidth(13),paddingVertical:ScreenUtil.autoheight(20),borderRadius: 5, }}>
                    <Image source={{uri: rowData.icon}} style={{width: ScreenUtil.autowidth(40),height: ScreenUtil.autowidth(40),}} resizeMode='stretch'/>
                    <View style={{flex: 1, paddingLeft:  ScreenUtil.autowidth(10),}}>
                      <Text style={[styles.headbtntext,{color: '#262626'}]} numberOfLines={1}>{rowData.name}</Text>
                      <Text style={[styles.descriptiontext,{color: '#808080'}]} numberOfLines={1}>{rowData.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

              )}
            />

          
        </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },

  headbtntext: {
    fontSize: ScreenUtil.setSpText(8),
    lineHeight: ScreenUtil.autoheight(20),
  },
  descriptiontext: {
    fontSize: ScreenUtil.setSpText(10),
    lineHeight: ScreenUtil.autoheight(14),
  },
  
 
});

export default DappAllList;

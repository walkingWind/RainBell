import { Component } from '@angular/core';
import { NavController,ViewController } from 'ionic-angular';
import { AddAlarm } from '../../pages/add-alarm/add-alarm';
import { Storage } from '@ionic/storage';
import {Push, PushObject, PushOptions} from "@ionic-native/push";
import { Geolocation } from '@ionic-native/geolocation';
import {RainBellServiceProvider} from '../../providers/rain-bell-service/rain-bell-service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  providers:[Push,RainBellServiceProvider]
})
export class AboutPage {
  weatherInfo:any;
  public alarmList=new Array();

  constructor(public navCtrl: NavController,private storage:Storage,private viewCtrl:ViewController,private push:Push,private geolocation: Geolocation
  ,private rainBellService:RainBellServiceProvider) {
    /// 监控页面变化事件
    viewCtrl.didEnter.subscribe(() => this.enterPageBefore());

      //storage.clear();
      // storage.ready().then(()=>{
      //   storage.forEach((value,key,iterationNumber)=>{
      //     // console.log(value);
      //     // console.log(key);
      //     // console.log(iterationNumber);
      //     this.alarmList.push(value);
      //   });
      // });
  }

  mysort(arr){
    arr=arr.sort(this.mySortArr);
    this.alarmList=arr;
  }

  enterPageBefore(){
    let arr=new Array();
    this.storage.ready().then(()=>{
      this.storage.forEach((value,key,iterationNumber)=>{
        arr.push(value);
        // console.log(iterationNumber);
        // console.log(value);
        this.mysort(arr);//由于这个then方法类似ajax，不是执行完才往下执行的，所以会有执行顺序问题，所以，需要每次都排序，才能使得顺序正确
      });

    });
  }

  addAlarm(){
    this.navCtrl.push(AddAlarm);
  }

  mySortArr(a,b){//自定义数组排序方法
    let num=(a['createTime']-b['createTime']);
    // console.log("差集"+(a['createTime']-b['createTime']));
    if(num>0) {
      return 1; //
    }else if(num==0) {
      return 0;
    }else {
      return -1; // 小于 0 ，那么 a 会被排列到 b 之前；
    }
  }


  deleteItem(item){
    console.log(item);
    let arr=new Array();
    this.storage.remove(item['id'].toString());//删除缓存
    this.storage.forEach((value,key,iterationNumber)=>{
     arr.push(value);
    });
    arr=arr.sort(this.mySortArr);
    console.log(arr);
    this.alarmList=arr;
  }


  //系统通知，还未测试
  mypush(){
    // to check if we have permission
    this.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
        } else {
          console.log('We do not have permission to send push notifications');
        }

      });

  // to initialize push notifications

    const options: PushOptions = {
      android: {
        senderID: '12345679'
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {}
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

    pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

  }

  //获取系统定位
  getMyLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log("经度"+resp.coords.longitude);
      console.log("纬度"+resp.coords.latitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    //每隔一段时间会重新获取你的定位
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      console.log(data);
    });
  }

  //获取天气情况
  getLocationWeather(){
    var self = this;
    this.rainBellService.getWeatherInfo().then(function(data){
      self.weatherInfo=data;
      console.log(data);
    })
  }

}

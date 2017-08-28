import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import {RainBellServiceProvider} from "../../providers/rain-bell-service/rain-bell-service";
declare let BMap;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers:[RainBellServiceProvider]
})
export class HomePage {
  public mymap:any;
  public myweatherInfo:any;
  public mylng;
  public mylat;
  public address;

  @ViewChild('map') mapElement: ElementRef;
  constructor(public navCtrl: NavController,private viewCtrl:ViewController,private geolocation: Geolocation
    ,private rainBellService:RainBellServiceProvider) {
    viewCtrl.willEnter.subscribe(() => this.enterPageBefore());

  }

  enterPageBefore(){
    this.getMyLocation();
    // console.log(111111);
    // this.map=new BMap.Map('map');
    // var point=new BMap.Point(116.404,39.915);
    // this.map.centerAndZoom(point,15);//初始化地图，及显示比例
    // this.map.setCurrentCity("");//设置地图显示城市，必须
    // this.map.enableScrollWheelZoom();
  }

  //百度回调
  showPoint(point){
    var marker = new BMap.Marker(point);
    this.mymap.addOverlay(marker);
    var label = new BMap.Label("你现在的大致位置",{offset:new BMap.Size(20,-10)});
    marker.setLabel(label); //添加百度label
    this.mymap.setCenter(point);
    // var address= "&nbsp;当前位置："+point.address.city+point.address.district+point.address.street+point.address.street_number;
    // console.log(address);
  }

  //获取系统定位
  getMyLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log("经度"+resp.coords.longitude);
      console.log("纬度"+resp.coords.latitude);
      // this.getBaiduPoint(resp.coords.longitude,resp.coords.latitude);
      this.mymap=new BMap.Map('map');
       var point=new BMap.Point(resp.coords.longitude,resp.coords.latitude);
      // var point=new BMap.Point(this.mylng,this.mylat);
      // this.mymap.centerAndZoom(point,15);//初始化地图，及显示比例
      // this.mymap.setCurrentCity("");//设置地图显示城市，必须
      // this.mymap.enableScrollWheelZoom();
      this.mymap.centerAndZoom(point,12);
      this.mymap.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
      this.mymap.addControl(new BMap.NavigationControl());
      var geolocation = new BMap.Geolocation();
      this.showPoint(point);

      var self = this;
      geolocation.getCurrentPosition(function(r){

        //这里没写好，下次继续写
        console.log(r['point']);
        // self.showPoint(r['point']);
        var address= point.address.city+point.address.district+point.address.street+point.address.street_number;
        console.log(address);
        self.address=address;
      });

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
  //百度坐标转换
  getBaiduPoint(lng,lat){
     var self = this;
    this.rainBellService.myPointToBaiduPoint(lng,lat).then(function(data){
       self.mylng=data['result'][0]['x'];
      self.mylng=data['result'][0]['y'];
      console.log(data);
      console.log(data['result'][0]['x']);
      console.log(data['result'][0]['y']);
    })
  }



  //获取天气情况
  getLocationWeather(){
    var self = this;
    this.rainBellService.getWeatherInfo().then(function(data){
      self.myweatherInfo=data;
      console.log(data);
    })
  }

}

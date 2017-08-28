import { Injectable } from '@angular/core';
import {Http, RequestOptions,Response} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the RainBellServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class RainBellServiceProvider {

  constructor(public http: Http) {
    console.log('Hello RainBellServiceProvider Provider');
  }

  getWeatherInfo(){
    //http://wthrcdn.etouch.cn/weather_mini?city=北京
    // let header = new Headers();
    // header.append('Content-Type', 'application/x-www-form-urlencoded');
    // let pramas = JSON.stringify({city: "北京"});
    // return new Promise((resolve, reject) => {
    //   this.http.post("http://wthrcdn.etouch.cn/weather_mini", pramas, header)
    //     .map(res => res.json())
    //     .subscribe(data => resolve(data), err => reject(err))
    // });


    // let headers = new Headers({
    //   'Content-Type': 'application/json' ,
    //   "Access-Control-Allow-Origin" : "*",
    //   "Access-Control-Allow-Credentials" : true });
    // let body = new FormData();
    // body.append('city', '北京');
    //
    // console.log(body);
    // console.log(headers);
    // return new Promise((resolve, reject) => {
    //   this.http.post('http://wthrcdn.etouch.cn/weather_mini',body,headers).map(res => res.json()).subscribe(res => {
    //     console.log(res);
    //     resolve(res);
    //   }, (err) => {
    //     console.log(err);
    //     reject(err);
    //   });
    //
    // });

    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    let options = new RequestOptions(headers);	//以前版本这个RequestOptions是可行的，后期版本似乎直接丢进//headers就可以了，如：let options = new RequestOptions(headers);

    let body= "";
    let cityCode="101040100";
    //http://weather.51wnl.com/weatherinfo/GetMoreWeather?cityCode=101040100&weatherType=0
    return new Promise((resolve, reject) => {
      this.http.post('http://weather.51wnl.com/weatherinfo/GetMoreWeather?cityCode='+cityCode+'&weatherType=0', body, options )
        .map((res:Response) => res.json())
        .subscribe(data => resolve(data), err => reject(err))
    })
  }

  myPointToBaiduPoint(lng,lat){
    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    let options = new RequestOptions(headers);	//以前版本这个RequestOptions是可行的，后期版本似乎直接丢进//headers就可以了，如：let options = new RequestOptions(headers);

    let body= "";
    let point=lng+","+lat;
    return new Promise((resolve, reject) => {
      this.http.post('http://api.map.baidu.com/geoconv/v1/?coords='+point+'&from=1&to=5&ak=ZHk2W8lSweGk96srXXr5YtxBG6QpLoob', body, options )
        .map((res:Response) => res.json())
        .subscribe(data => resolve(data), err => reject(err))
    })
  }

}

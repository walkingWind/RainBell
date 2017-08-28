import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import { AboutPage } from '../../pages/about/about';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the AddAlarm page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-add-alarm',
  templateUrl: 'add-alarm.html',
})
export class AddAlarm {
  alarmName:string;
  mytime:any;
  testCheckboxOpen: boolean;//弹出窗选择
  testCheckboxResult;//弹出窗结果
  reData:any={"showName":"","value":""};//页面显示
  testRadioOpen:boolean;
  testRadioResult;
  voice:any={"showName":"","value":""};
  voiceList=['天黑黑','大海'];
  //天气开关
  sunnyToggle:boolean;
  rainyToggle:boolean;
  cloudyToggle:boolean;
  snowToggle:boolean;
  // alarmList=new Array();
  constructor(public navCtrl: NavController, public navParams: NavParams,public alertCtrl: AlertController,
  private storage:Storage,private toastCtrl:ToastController) {

    storage.ready().then(()=>{

    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddAlarm');

  }


  showWeekCheckbox() {
    let alert = this.alertCtrl.create();
    alert.setTitle('请选择重复日期');

    alert.addInput({
      type: 'checkbox',
      label: '每周日',
      value: '0',
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周一',
      value: '1'
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周二',
      value: '2'
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周三',
      value: '3'
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周四',
      value: '4'
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周五',
      value: '5'
    });
    alert.addInput({
      type: 'checkbox',
      label: '每周六',
      value: '6'
    });

    alert.addButton('取消');
    alert.addButton({
      text: '确定',
      handler: data => {
        console.log('Checkbox data:', data);
        this.testCheckboxOpen = false;
        this.testCheckboxResult = data;
        this.reData={"showName":this.testCheckboxResult.toString().replace('0','周日')
          .replace('1','周一').replace('2','周二').replace('3','周三').replace('4','周四')
          .replace('5','周五').replace('6','周六'),"value":data};
      }
    });
    alert.present();
  }

  showRadioVoice(){
      let alert = this.alertCtrl.create();
      alert.setTitle('选择铃声');

      alert.addInput({
        type: 'radio',
        label: '天黑黑',
        value: '0',
      });

    alert.addInput({
      type: 'radio',
      label: '大海',
      value: '1',
    });

      alert.addButton('取消');
      alert.addButton({
        text: '确定',
        handler: data => {
          this.testRadioOpen = false;
          this.testRadioResult = data;
          if(this.testRadioResult){
            this.voice={"showName":this.testRadioResult.toString().replace(data.toString(),this.voiceList[Number(data)]),"value":data};
          }
          console.log(this.voice);
          console.log(this.testRadioResult);
        }
      });
      alert.present();
  }

  save(){
    //参数非空判断
    if(!this.alarmName){
      let toast=this.toastCtrl.create({
        message:"标签不能为空",
        duration:1500,
        position:"top"
      });
      toast.present();
      return;
    }

    if(!this.mytime){
      let toast=this.toastCtrl.create({
        message:"时间不能为空",
        duration:1500,
        position:"top"
      });
      toast.present();
      return;
    }
    if(!this.voice){
      this.voice=0;
    }

    var weatherArr=[];
    if(this.sunnyToggle){
      weatherArr.push('sunny');
    }
    if(this.rainyToggle){
      weatherArr.push('rainy');
    }
    if(this.cloudyToggle){
      weatherArr.push('cloudy');
    }
    if(this.snowToggle){
      weatherArr.push('snow');
    }

    //对新增的闹铃进行本地存储
    var id=this.generateUUID();
    var alarm={'id':id,'alarmName':this.alarmName,'mytime':this.mytime,'reData':this.reData,'voice':this.voice,'weather':weatherArr,'isOpen':true,'createTime':new Date().getTime()};
    // this.alarmList.push(alarm);

    this.storage.set(id,alarm);

    //this.navCtrl.pop();

     this.navCtrl.popTo(AboutPage);

  }



  generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };





}

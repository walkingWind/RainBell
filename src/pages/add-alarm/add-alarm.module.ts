import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddAlarm } from './add-alarm';

@NgModule({
  declarations: [
    AddAlarm,
  ],
  imports: [
    IonicPageModule.forChild(AddAlarm),
  ],
  exports: [
    AddAlarm
  ]
})
export class AddAlarmModule {}

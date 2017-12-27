import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WxService } from './wx.service';
import { MeepoCoreServiceModule } from 'meepo-core';
import { AxiosModule } from 'meepo-axios';

@NgModule({
    declarations: [
        
    ],
    imports: [ CommonModule, MeepoCoreServiceModule, AxiosModule ],
    exports: [],
    providers: [
        WxService
    ],
})
export class JssdkModule {}

export { WxService } from './wx.service';

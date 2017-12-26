import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WxService } from './wx.service';
@NgModule({
    declarations: [
        
    ],
    imports: [ CommonModule ],
    exports: [],
    providers: [
        WxService
    ],
})
export class JssdkModule {}

export { WxService } from './wx.service';

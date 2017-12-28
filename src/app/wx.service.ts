import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { CoreService } from 'meepo-core';
import { AxiosService } from 'meepo-axios';
declare const wx: any;

@Injectable()
export class WxService {
  // 选择图片
  imgPicker$: Subject<any> = new Subject();
  // 上传图片
  imgUpload$: Subject<any> = new Subject();
  // 到服务器
  imgAdd$: Subject<any> = new Subject();

  constructor(
    public core: CoreService,
    public axios: AxiosService
  ) {
    this.imgPicker$.subscribe(ids => {
      this.checkIds(ids);
    });
    this.imgUpload$.subscribe(sid => {
      this.addImage(sid);
    });
  }

  checkIds(ids: any[] = []) {
    let id;
    if (ids && ids.length > 0) {
      id = ids.pop();
      this.uploadImage(id, (sid) => {
        this.checkIds(ids);
      });
    }
  }

  onMenuShareTimeline(bodyMenuShareTimeline: any): Observable<any> {
    let share$: Subject<any> = new Subject();
    bodyMenuShareTimeline.success = () => {
      share$.next({
        status: 'success',
        type: 'timeline'
      });
    };
    bodyMenuShareTimeline.cancel = () => {
      share$.next({
        status: 'cancel',
        type: 'timeline'
      });
    };
    wx.ready(() => {
      wx.onMenuShareTimeline(bodyMenuShareTimeline);
    });
    return share$.asObservable();
  }

  onMenuShareAppMessage(bodyMenuShareAppMessage: any): Observable<any> {
    let share$: Subject<any> = new Subject();
    bodyMenuShareAppMessage.success = () => {
      share$.next({
        status: 'success',
        type: 'appmessage'
      });
    };
    bodyMenuShareAppMessage.cancel = () => {
      share$.next({
        status: 'cancel',
        type: 'appmessage'
      });
    };
    wx.ready(() => {
      wx.onMenuShareAppMessage(bodyMenuShareAppMessage);
    });
    return share$.asObservable();
  }

  onMenuShareQQ(bodyMenuShareQQ: any): Observable<any> {
    let share$: Subject<any> = new Subject();
    bodyMenuShareQQ.success = () => {
      share$.next({
        status: 'success',
        type: 'qq'
      });
    };
    bodyMenuShareQQ.cancel = () => {
      share$.next({
        status: 'cancel',
        type: 'qq'
      });
    };
    wx.ready(() => {
      wx.onMenuShareQQ(bodyMenuShareQQ);
    });
    return share$.asObservable();
  }

  onMenuShareWeibo(bodyMenuShareWeibo: any): Observable<any> {
    let share$: Subject<any> = new Subject();
    bodyMenuShareWeibo.success = () => {
      share$.next({
        status: 'success',
        type: 'qq'
      });
    };
    bodyMenuShareWeibo.cancel = () => {
      share$.next({
        status: 'cancel',
        type: 'qq'
      });
    };
    wx.ready(() => {
      wx.onMenuShareWeibo(bodyMenuShareWeibo);
    });
    return share$.asObservable();
  }

  onMenuShareQZone(body: any) {
    let share$: Subject<any> = new Subject();
    body.success = () => {
      share$.next({
        status: 'success',
        type: 'qzone'
      });
    };
    body.cancel = () => {
      share$.next({
        status: 'cancel',
        type: 'qzone'
      });
    };
    wx.ready(() => {
      wx.onMenuShareQZone(body);
    });
    return share$.asObservable();
  }

  getLocalImgData(localId: string) {
    let choose$: Subject<any> = new Subject();
    let body = {
      localId: localId,
      success: (res: any) => {
        choose$.next(res.localData);
      }
    };
    wx.ready(() => {
      wx.getLocalImgData(body);
    });
    return choose$.asObservable();
  }

  addImage(sid: string) {
    let url = this.core.murl('entry//open', { __do: 'audio.image', m: 'imeepos_runner' }, false);
    this.axios.bpost(url, { serverId: sid }).subscribe((re: any) => {
      this.imgAdd$.next(re);
    });
  }

  chooseImage(count: number = 9): this {
    let body = {
      count: count,
      success: (res: any) => {
        this.imgPicker$.next(res.localIds);
      }
    };
    wx.ready(() => {
      wx.chooseImage(body);
    });
    return this;
  }

  uploadImage(localId: string, call: any): this {
    let body = {
      localId: localId,
      success: (res: any) => {
        this.imgUpload$.next(res.serverId);
        call(res.serverId)
      }
    };
    wx.ready(() => {
      wx.uploadImage(body);
    });
    return this;
  }

  downloadImage(serverId: string): Observable<any> {
    let choose$: Subject<any> = new Subject();
    let body = {
      serverId: serverId,
      success: (res: any) => {
        choose$.next(res.localId);
      }
    };
    wx.downloadImage(body);
    return choose$.asObservable();
  }

  previewImage(current: string, urls: string[]): this {
    wx.previewImage({
      current: current,
      urls: urls
    });
    return this;
  }
  // 开始录音结束返回
  startRecord(): Observable<any> {
    let choose$: Subject<any> = new Subject();
    wx.startRecord({});
    this.stopRecord().subscribe(res => {
      choose$.next(res);
    });
    this.onVoiceRecordEnd().subscribe(res => {
      choose$.next(res);
    });
    return choose$.asObservable();
  }

  stopRecord(): Observable<any> {
    let choose$: Subject<any> = new Subject();
    wx.stopRecord({
      success: (res: any) => {
        choose$.next(res.localId);
      }
    });
    return choose$.asObservable();
  }

  startSearchBeacons(ticket: string) {
    let choose$: Subject<any> = new Subject();
    wx.startSearchBeacons({
      ticket: ticket,
      complete: (argv) => {
        choose$.next(argv);
      }
    });
    return choose$;
  }

  stopSearchBeacons() {
    let choose$: Subject<any> = new Subject();
    wx.stopSearchBeacons({
      complete: (res) => {
        choose$.next(res);
      }
    })
    return choose$;
  }

  onSearchBeacons() {
    let choose$: Subject<any> = new Subject();
    wx.onSearchBeacons({
      complete: (res) => {
        choose$.next(res);
      }
    })
    return choose$;
  }

  openProductSpecificView(productId: string, viewType: number = 0) {
    wx.openProductSpecificView({
      productId: productId,
      viewType: viewType
    });
  }

  onVoiceRecordEnd() {
    let choose$: Subject<any> = new Subject();
    wx.onVoiceRecordEnd({
      complete: (res) => {
        choose$.next(res.localId);
      }
    });
    return choose$.asObservable();
  }

  // 播放语音

  playVoice(localId: string) {
    wx.playVoice({
      localId: localId
    });
  }

  pauseVoice(localId: string) {
    wx.pauseVoice({
      localId: localId
    })
  }

  stopVoice(localId: string) {
    wx.stopVoice({
      localId: localId
    });
  }

  onVoicePlayEnd(serverId: string) {
    let choose$: Subject<any> = new Subject();
    wx.onVoicePlayEnd({
      serverId: serverId,
      success: (res: any) => {
        choose$.next(res.localId);
      }
    });
    return choose$;
  }

  uploadVoice(localId: string) {
    let choose$: Subject<any> = new Subject();
    wx.onVoicePlayEnd({
      localId: localId,
      success: (res: any) => {
        choose$.next(res.serverId);
      }
    });
    return choose$;
  }

  downloadVoice(serverId: string) {
    let choose$: Subject<any> = new Subject();
    wx.onVoicePlayEnd({
      serverId: serverId,
      success: (res: any) => {
        choose$.next(res.localId);
      }
    });
    return choose$;
  }

  translateVoice(localId: string) {
    let choose$: Subject<any> = new Subject();
    wx.translateVoice({
      localId: localId,
      success: (res) => {
        choose$.next(res.translateResult);
      }
    });
    return choose$;
  }

  getNetworkType() {
    let choose$: Subject<any> = new Subject();
    wx.getNetworkType({
      success: (res) => {
        choose$.next(res.networkType);
      }
    });
    return choose$;
  }

  openLocation(body: any) {
    wx.openLocation(body);
  }

  getLocation(type: string = 'wgs84') {
    let choose$: Subject<any> = new Subject();
    let body = {
      type: type,
      success: (res: any) => {
        choose$.next({
          latitude: res.latitude,
          longitude: res.longitude,
          speed: res.speed,
          accuracy: res.accuracy
        });
      }
    };
    wx.getLocation(body);
    return choose$;
  }

  closeWindow() {
    wx.closeWindow({});
    return this;
  }

  scanQRCode(needResult: number = 0) {
    let choose$: Subject<any> = new Subject();
    let body = {
      needResult: needResult,
      success: (res: any) => {
        choose$.next(res.resultStr);
      }
    };
    wx.getLocation(body);
    return choose$;
  }

  addCard(cardList: any[]) {
    let choose$: Subject<any> = new Subject();
    wx.addCard({
      cardList: cardList,
      success: (res) => {
        choose$.next(res.cardList);
      }
    });
    return choose$;
  }

  openCard(cardList: any[]) {
    wx.openCard({
      cardList: cardList
    });
  }

  chooseCard(body: any) {
    let choose$: Subject<any> = new Subject();
    body.success = (res) => {
      choose$.next(res.cardList);
    }
    wx.chooseCard(body);
    return choose$;
  }

  chooseWXPay(body: any) {
    let choose$: Subject<any> = new Subject();
    body.success = (res: any) => {
      choose$.next(res);
    }
    wx.chooseWXPay(body);
    return choose$;
  }

  openAddress() {
    let choose$: Subject<any> = new Subject();
    wx.openAddress({
      success: (res: any) => {
        choose$.next(res);
      }
    });
    return choose$;
  }

}
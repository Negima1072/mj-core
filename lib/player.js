/*
 *  Majiang.Player
 */
"use strict";

const Majiang = {
    Shoupai: require('./shoupai'),
    He:      require('./he'),
    Game:    require('./game'),
    Board:   require('./board'),
    Util:    Object.assign(require('./xiangting'),
                           require('./hule'))
};

module.exports = class Player {

    action(msg, callback) {

        this._callback = callback;

        if      (msg.kaiju)    this.kaiju  (msg.kaiju);
        else if (msg.qipai)    this.qipai  (msg.qipai);
        else if (msg.zimo)     this.zimo   (msg.zimo);
        else if (msg.dapai)    this.dapai  (msg.dapai);
        else if (msg.fulou)    this.fulou  (msg.fulou);
        else if (msg.gang)     this.gang   (msg.gang);
        else if (msg.gangzimo) this.zimo   (msg.gangzimo, true)
        else if (msg.kaigang)  this.kaigang(msg.kaigang);
        else if (msg.hule)     this.hule   (msg.hule);
        else if (msg.pingju)   this.pingju (msg.pingju);
        else if (msg.jieju)    this.jieju  (msg.jieju);
    }

    get shoupai() { return this._model.shoupai[this._menfeng] }
    get he()      { return this._model.he[this._menfeng]      }
    get shan()    { return this._model.shan                   }
    get tingpai() {
        return Majiang.Util.xiangting(this.shoupai) == 0
                && Majiang.Util.tingpai(this.shoupai)
            || [];
    }

    kaiju(kaiju) {
        this._id    = kaiju.id;
        this._rule  = kaiju.rule;
        this._model = new Majiang.Board(kaiju);
    }
    qipai(qipai) {
        this._model.qipai(qipai);
        this._menfeng   = this._model.menfeng(this._id);
        this._diyizimo  = true;
        this._n_gang    = 0;
        this._neng_rong = true;
    }
    zimo(zimo, gangzimo) {
        this._model.zimo(zimo);
        if (gangzimo) this._n_gang++;
    }
    dapai(dapai) {
        this._model.dapai(dapai);

        if (dapai.l == this._menfeng) {
            this._diyizimo = false;
            if (! this.shoupai.lizhi) this._neng_rong = true;
            if (this.tingpai.find(p=> this.he.find(p))) this._neng_rong = false;
        }
        else {
            if (this.tingpai.find(p=> p == dapai.p)) this._neng_rong = false;
        }
    }
    fulou(fulou) {
        this._model.fulou(fulou);
        this._diyizimo = false;
    }
    gang(gang) {
        this._model.gang(gang);
        this._diyizimo = false;
        if (gang.l != this._menfeng && ! gang.m.match(/^[mpsz]\d{4}$/)) {
            let s = gang.m[0], n = +gang.m.substr(-1)||5;
            if (this.tingpai.find(p=> p == s+n)) this._neng_rong = false;
        }
    }
    kaigang(kaigang) {
        this._model.kaigang(kaigang);
    }
    hule(hule) {
        this._model.hule(hule);
    }
    pingju(pingju) {
        this._model.pingju(pingju);
    }
    jieju(paipu) {
        this._paipu = paipu;
    }

    get_dapai(shoupai) {
        return Majiang.Game.get_dapai(this._rule, shoupai);
    }
    get_chi_mianzi(shoupai, p) {
        return Majiang.Game.get_chi_mianzi(this._rule, shoupai, p,
                                           this.shan.paishu);
    }
    get_peng_mianzi(shoupai, p) {
        return Majiang.Game.get_peng_mianzi(this._rule, shoupai, p,
                                            this.shan.paishu);
    }
    get_gang_mianzi(shoupai, p) {
        return Majiang.Game.get_gang_mianzi(this._rule, shoupai, p,
                                            this.shan.paishu, this._n_gang);
    }
    allow_lizhi(shoupai, p) {
        return Majiang.Game.allow_lizhi(this._rule, shoupai, p,
                                        this.shan.paishu,
                                        this._model.defen[this._id]);
    }
    allow_hule(shoupai, p, hupai) {
        hupai = hupai || shoupai.lizhi || this.shan.paishu == 0;
        return Majiang.Game.allow_hule(this._rule, shoupai, p,
                                       this._model.zhuangfeng, this._menfeng,
                                       hupai, this._neng_rong);
    }
    allow_pingju(shoupai) {
        return Majiang.Game.allow_pingju(this._rule, shoupai,
                                         this._diyizimo);
    }
}
/* Isolated feed-by-tank reporting calculations. No database writes. */
(function(root){
  'use strict';
  function report(records){
    const byTank=new Map();
    for(const r of records){
      const tons=Number(r.tons);
      if(!r.tank_id||!r.feed_type||!Number.isFinite(tons)||tons<=0)throw Error('Invalid feed allocation');
      const key=String(r.tank_id);
      if(!byTank.has(key))byTank.set(key,{tank_id:key,feeds:{},total_tons:0,history:[]});
      const tank=byTank.get(key);
      const feed=String(r.feed_type).trim().replace(/\s+/g,' ').toUpperCase();
      tank.feeds[feed]=Number(((tank.feeds[feed]||0)+tons).toFixed(2));
      tank.total_tons=Number((tank.total_tons+tons).toFixed(2));
      tank.history.push({date:r.date,feed_type:feed,tons});
    }
    return [...byTank.values()];
  }
  root.CKFeedStageReport={report};
})(typeof globalThis!=='undefined'?globalThis:this);

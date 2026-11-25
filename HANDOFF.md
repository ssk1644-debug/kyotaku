
## w116 (11/25)
- レンタル確認：借りるに決めた後でも「🛒 購入に変える」(rtBuy)。確認メモを全幅textareaに
- 事務の画面にも利用者の地図タブ（t-umap）。事務はカレンダー渡した・点検・チェックインのボタンなし
- ほかの場所チェックイン：caselog kind=場所訪問(case "p:"+場所id, JSON{t,nm,lat,lng,memo,away})、よく行く場所 kind=場所(id pl…)。150m以内で「近くです」。日報(npAuto)・📊動き(pc)に出る。案件カード/事務に知らせる(reqs office空)も同時に

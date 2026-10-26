/* PIRALI Alpha 0.16.1 — stage-six 20% bonus, stage-only cap */
(function(){
'use strict';
let tracking=false,baseline=0,previous=0,earned=0;
const oldScore=updateScoreUI;
updateScoreUI=function(){
 if(level!==6){tracking=false;oldScore();return;}
 if(!tracking){tracking=true;baseline=score;previous=score;earned=0;}
 else{const raw=score-previous;if(raw>0)earned=Math.min(5000,earned+Math.round(raw*1.2));score=baseline+earned;previous=score;}
 oldScore();
};
})();

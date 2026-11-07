package ge.weeklyplus.app

import android.content.Context
import androidx.compose.runtime.*
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/** 24 deals, 4 players. Groups 8+4+8+4. */
object JokerRules {
    val cards=(1..8).toList()+List(4){9}+(8 downTo 1).toList()+List(4){9}
    val groups=listOf(0..7,8..11,12..19,20..23)
    fun points(cards:Int,bid:Int,taken:Int)=when {
        bid==cards && taken==cards -> 100*cards
        bid==taken -> 50*(bid+1)
        bid>0 && taken==0 -> -200
        else -> taken*10
    }
    data class Score(val totals:List<Int>,val group:List<List<Int>>,val premiums:List<List<Int>>)
    fun calculate(rounds:List<JokerRound>):Score {
        val result=mutableListOf<List<Int>>()
        val premiums=mutableListOf<List<Int>>()
        for(range in groups) {
            val portion=range.mapNotNull{rounds.getOrNull(it)}
            val base=(0..3).map{p->portion.sumOf{points(it.cards,it.bids[p],it.taken[p])}}
            val bonus=MutableList(4){0}
            if(portion.size==range.count()) {
                val exact=(0..3).filter{p->portion.all{it.bids[p]==it.taken[p]}}
                val choices=portion.dropLast(1)
                if(choices.isNotEmpty()) {
                    for(p in exact)bonus[p]+=choices.maxOf{points(it.cards,it.bids[p],it.taken[p])}.coerceAtLeast(0)
                    if(exact.size==1)for(p in 0..3)if(p!=exact.first()) {
                        bonus[p]-=choices.maxOf{points(it.cards,it.bids[p],it.taken[p])}.coerceAtLeast(0)
                    }
                }
            }
            result.add((0..3).map{base[it]+bonus[it]})
            premiums.add(bonus)
        }
        return Score((0..3).map{p->result.sumOf{it[p]}},result,premiums)
    }
}
data class JokerRound(val cards:Int,val bids:List<Int>,val taken:List<Int>) {
    fun json()=JSONObject().apply{put("cards",cards);put("bids",JSONArray(bids));put("taken",JSONArray(taken))}
    companion object {
        fun parse(o:JSONObject):JokerRound? {
            val b=o.optJSONArray("bids")?:o.optJSONArray("bid")?:return null
            val t=o.optJSONArray("taken")?:return null
            val cards=o.optInt("cards")
            if(cards !in 1..9||b.length()!=4||t.length()!=4)return null
            val bb=(0..3).map{b.optInt(it,-1)};val tt=(0..3).map{t.optInt(it,-1)}
            if(bb.any{it !in 0..cards}||tt.any{it !in 0..cards}||tt.sum()!=cards)return null
            return JokerRound(cards,bb,tt)
        }
    }
}
data class JokerMatch(val date:String,val players:List<String>,val rounds:List<JokerRound>) {
    val points get()=JokerRules.calculate(rounds).totals
    fun json()=JSONObject().apply{put("date",date);put("players",JSONArray(players))
        put("rounds",JSONArray().apply{rounds.forEach{put(it.json())}})}
    companion object {
        fun parse(o:JSONObject):JokerMatch? {
            val pp=o.optJSONArray("players")?:return null
            val rr=o.optJSONArray("rounds")?:return null
            if(pp.length()!=4||rr.length()!=24)return null
            val rounds=(0 until 24).mapNotNull{rr.optJSONObject(it)?.let(JokerRound::parse)}
            if(rounds.size!=24||rounds.indices.any{rounds[it].cards!=JokerRules.cards[it]})return null
            return JokerMatch(o.optString("date"),(0..3).map{pp.optString(it)},rounds)
        }
    }
}
class JokerHistory(context:Context) {
    private val pref=context.getSharedPreferences("diary_joker_v2",Context.MODE_PRIVATE)
    val names=mutableStateListOf("მოთამაშე 1","მოთამაშე 2","მოთამაშე 3","მოთამაშე 4")
    val rounds=mutableStateListOf<JokerRound>()
    val matches=mutableStateListOf<JokerMatch>()
    init{load()}
    private fun load()=runCatching {
        val nn=JSONArray(pref.getString("names","[]"))
        for(i in 0 until minOf(4,nn.length()))names[i]=nn.optString(i,names[i])
        val rr=JSONArray(pref.getString("rounds","[]"))
        for(i in 0 until rr.length()) {
            val r=rr.optJSONObject(i)?.let(JokerRound::parse)?:continue
            if(i==rounds.size&&r.cards==JokerRules.cards[i])rounds.add(r)
        }
        val history=JSONArray(pref.getString("history","[]"))
        for(i in 0 until history.length())history.optJSONObject(i)?.let(JokerMatch::parse)?.let{matches.add(it)}
    }.getOrNull()
    val cardCount get()=JokerRules.cards.getOrNull(rounds.size)
    val scores get()=JokerRules.calculate(rounds)
    fun name(i:Int,value:String){if(i in 0..3){names[i]=value.take(28);save()}}
    fun add(b:List<Int>,t:List<Int>):Boolean {
        val n=cardCount?:return false
        if(b.size!=4||t.size!=4||b.any{it !in 0..n}||t.any{it !in 0..n}||t.sum()!=n)return false
        rounds.add(JokerRound(n,b,t))
        if(rounds.size==24){
            val stamp=LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
            matches.add(0,JokerMatch(stamp,names.toList(),rounds.toList()))
            rounds.clear()
            while(matches.size>150)matches.removeAt(matches.lastIndex)
        }
        save();return true
    }
    fun undo(){if(rounds.isNotEmpty()){rounds.removeAt(rounds.lastIndex);save()}}
    fun remove(i:Int){if(i in matches.indices){matches.removeAt(i);save()}}
    fun exportJson()=JSONObject().apply{put("schema",2);put("matches",JSONArray().apply{matches.forEach{put(it.json())}})}.toString(2)
    fun importJson(raw:String):Int {
        val json=JSONObject(raw)
        require(json.optInt("schema")==2)
        val arr=json.getJSONArray("matches")
        val incoming=(0 until arr.length()).mapNotNull{arr.optJSONObject(it)?.let(JokerMatch::parse)}
        var added=0
        for(m in incoming)if(matches.none{it.date==m.date&&it.players==m.players&&it.rounds==m.rounds}){matches.add(m);added++}
        while(matches.size>150)matches.removeAt(matches.lastIndex)
        save();return added
    }
    private fun save(){pref.edit()
        .putString("names",JSONArray(names.toList()).toString())
        .putString("rounds",JSONArray().apply{rounds.forEach{put(it.json())}}.toString())
        .putString("history",JSONArray().apply{matches.forEach{put(it.json())}}.toString()).apply()}
}

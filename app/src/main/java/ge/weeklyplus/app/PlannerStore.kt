package ge.weeklyplus.app

import android.content.Context
import androidx.compose.runtime.*
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.UUID

val TASK_CATEGORIES = listOf("სამუშაო", "პირადი", "ჯანმრთელობა", "სწავლა", "საყიდლები", "სხვა")

data class PlanTask(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val date: String,
    val time: String = "",
    val category: String = "პირადი",
    val details: String = "",
    val priorities: Map<String, Int> = emptyMap(),
    val repeat: String = "none", // none | daily | weekly | monthly
    val reminder: Int = -1, // -1 means off; 0, 5, 15, 30, 1440 minutes before
    val goalId: String = "",
    val completed: Set<String> = emptySet(),
    val durationMinutes: Int = 0
)

data class PlanGoal(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val target: Int = 1,
    val category: String = "პირადი"
)

fun occurrence(task: PlanTask, date: LocalDate): Boolean {
    val start = runCatching { LocalDate.parse(task.date) }.getOrNull() ?: return false
    if (date < start) return false
    return when (task.repeat) {
        "daily" -> true
        "weekly" -> date.dayOfWeek == start.dayOfWeek
        "monthly" -> date.dayOfMonth == start.dayOfMonth
        else -> date == start
    }
}
fun taskComplete(task: PlanTask, date: LocalDate): Boolean = task.completed.contains(date.toString())
fun taskTime(task: PlanTask): LocalTime? = runCatching { LocalTime.parse(task.time, DateTimeFormatter.ofPattern("HH:mm")) }.getOrNull()

class PlannerStore(private val context: Context) {
    private val prefs = context.getSharedPreferences("weeklyplus_v1", Context.MODE_PRIVATE)
    val tasks = mutableStateListOf<PlanTask>()
    val goals = mutableStateListOf<PlanGoal>()
    var dark by mutableStateOf(prefs.getBoolean("dark", false)); private set
    var language by mutableStateOf((prefs.getString("language",null) ?: if(prefs.getBoolean("english",false)) "en" else "ka").takeIf { it in DiaryWords.languages.map { p -> p.first } } ?: "ka"); private set
    val english get() = language != "ka"
    var reminderDefault by mutableIntStateOf(prefs.getInt("reminder_default", -1)); private set
    var quietStart by mutableStateOf(prefs.getString("quiet_start", "22:00") ?: "22:00"); private set
    var quietEnd by mutableStateOf(prefs.getString("quiet_end", "08:00") ?: "08:00"); private set
    var quietEnabled by mutableStateOf(prefs.getBoolean("quiet_enabled", false)); private set
    var onboarded by mutableStateOf(prefs.getBoolean("onboarded", false)); private set

    init { load() }
    private fun load() {
        runCatching {
            val arr = JSONArray(prefs.getString("tasks", "[]") ?: "[]")
            for (i in 0 until arr.length()) {
                val j = arr.getJSONObject(i)
                val done = j.optJSONArray("completed") ?: JSONArray()
                tasks.add(PlanTask(
                    id = j.getString("id"), title = j.getString("title"), date = j.getString("date"),
                    time = j.optString("time"), category = j.optString("category", "პირადი"),
                    details = j.optString("details"), priorities = (j.optJSONObject("priorities") ?: JSONObject()).let { p -> p.keys().asSequence().associateWith { p.optInt(it, 0) } },
                    repeat = j.optString("repeat", "none"), reminder = j.optInt("reminder", -1),
                    goalId = j.optString("goalId"),
                    completed = (0 until done.length()).map { done.getString(it) }.toSet(),
                    durationMinutes = j.optInt("durationMinutes", 0).coerceIn(0,1440)
                ))
            }
            val gs = JSONArray(prefs.getString("goals", "[]") ?: "[]")
            for (i in 0 until gs.length()) {
                val j = gs.getJSONObject(i)
                goals.add(PlanGoal(j.getString("id"), j.getString("title"), j.optInt("target", 1), j.optString("category", "პირადი")))
            }
        }.onFailure { android.util.Log.e("WEEKLY+", "Failed to read data", it) }
    }
    private fun save() {
        val ts = JSONArray()
        tasks.forEach { t -> ts.put(JSONObject().apply {
            put("id", t.id); put("title", t.title); put("date", t.date); put("time", t.time)
            put("category", t.category); put("details", t.details); put("priorities", JSONObject(t.priorities))
            put("repeat", t.repeat); put("reminder", t.reminder); put("goalId", t.goalId)
            put("completed", JSONArray(t.completed.toList())); put("durationMinutes",t.durationMinutes)
        }) }
        val gs = JSONArray()
        goals.forEach { g -> gs.put(JSONObject().apply {
            put("id", g.id); put("title", g.title); put("target", g.target); put("category", g.category)
        }) }
        prefs.edit().putString("tasks", ts.toString()).putString("goals", gs.toString()).apply()
    }
    fun exportBackup():String = JSONObject().apply {
        put("app","DGIURI")
        put("format",1)
        put("exportedAt",java.time.Instant.now().toString())
        put("tasks",JSONArray(prefs.getString("tasks","[]") ?: "[]"))
        put("goals",JSONArray(prefs.getString("goals","[]") ?: "[]"))
        put("settings",JSONObject().apply {
            put("language",language);put("dark",dark);put("reminder_default",reminderDefault)
            put("quiet_enabled",quietEnabled);put("quiet_start",quietStart);put("quiet_end",quietEnd)
        })
    }.toString(2)
    fun importBackup(raw:String):Boolean = runCatching {
        val json=JSONObject(raw)
        require(json.optString("app")=="DGIURI")
        val ts=json.getJSONArray("tasks")
        val gs=json.getJSONArray("goals")
        for(i in 0 until ts.length()) {
            val row=ts.getJSONObject(i)
            require(row.getString("id").isNotBlank() && row.getString("title").isNotBlank())
            LocalDate.parse(row.getString("date"))
        }
        for(i in 0 until gs.length()) { require(gs.getJSONObject(i).getString("id").isNotBlank()) }
        val opts=json.optJSONObject("settings") ?: JSONObject()
        prefs.edit().putString("tasks",ts.toString()).putString("goals",gs.toString())
            .putString("language",opts.optString("language",language).takeIf{ code->DiaryWords.languages.any{it.first==code} } ?: language)
            .putBoolean("dark",opts.optBoolean("dark",dark))
            .putInt("reminder_default",opts.optInt("reminder_default",reminderDefault))
            .putBoolean("quiet_enabled",opts.optBoolean("quiet_enabled",quietEnabled))
            .putString("quiet_start",opts.optString("quiet_start",quietStart))
            .putString("quiet_end",opts.optString("quiet_end",quietEnd))
            .commit()
        tasks.clear();goals.clear();load()
        dark=prefs.getBoolean("dark",false)
        language=prefs.getString("language","ka") ?: "ka";DiaryWords.code=language
        reminderDefault=prefs.getInt("reminder_default",-1)
        quietEnabled=prefs.getBoolean("quiet_enabled",false)
        quietStart=prefs.getString("quiet_start","22:00") ?: "22:00"
        quietEnd=prefs.getString("quiet_end","08:00") ?: "08:00"
        ReminderScheduler.rescheduleAll(context,tasks.toList())
        true
    }.getOrDefault(false)
    fun addTask(t: PlanTask) { tasks.add(t); persistAndReschedule() }
    fun updateTask(t: PlanTask) { val i = tasks.indexOfFirst { it.id == t.id }; if (i >= 0) { tasks[i] = t; persistAndReschedule() } }
    fun deleteTask(id: String) { tasks.removeAll { it.id == id }; persistAndReschedule() }
    fun toggleTask(t: PlanTask, date: LocalDate) {
        val d = date.toString()
        updateTask(t.copy(completed = if (d in t.completed) t.completed - d else t.completed + d))
    }
    fun togglePriority(t: PlanTask, date: LocalDate): Boolean {
        val day = date.toString()
        if ((t.priorities[day] ?: 0) > 0) { updateTask(t.copy(priorities = t.priorities - day)); return true }
        val active = tasks.count { (it.priorities[day] ?: 0) > 0 && occurrence(it, date) }
        if (active >= 3) return false
        val next = (tasks.filter { (it.priorities[day] ?: 0) > 0 && occurrence(it, date) }.maxOfOrNull { it.priorities[day] ?: 0 } ?: 0) + 1
        updateTask(t.copy(priorities = t.priorities + (day to next))); return true
    }
    fun movePriority(t: PlanTask, date: LocalDate, delta: Int) {
        val day = date.toString()
        val sorted = tasks.filter { (it.priorities[day] ?: 0) > 0 && occurrence(it, date) }.sortedBy { it.priorities[day] ?: 0 }
        val idx = sorted.indexOfFirst { it.id == t.id }; val newIdx = idx + delta
        if (idx !in sorted.indices || newIdx !in sorted.indices) return
        val other = sorted[newIdx]
        val oldRank = t.priorities[day] ?: 0
        val otherRank = other.priorities[day] ?: 0
        updateTask(t.copy(priorities = t.priorities + (day to otherRank))); updateTask(other.copy(priorities = other.priorities + (day to oldRank)))
    }
    fun addGoal(g: PlanGoal) { goals.add(g); save() }
    fun deleteGoal(id: String) { goals.removeAll { it.id == id }; for (i in tasks.indices) { if (tasks[i].goalId == id) tasks[i] = tasks[i].copy(goalId = "") }; persistAndReschedule() }
    fun changeDark(v: Boolean) { dark=v; prefs.edit().putBoolean("dark",v).apply() }
    fun changeLanguage(code:String) {
        if(code !in DiaryWords.languages.map {it.first}) return
        language=code
        DiaryWords.code=code
        prefs.edit().putString("language",code).putBoolean("english",code=="en").apply()
    }
    fun changeEnglish(v: Boolean) { changeLanguage(if(v)"en" else "ka") }
    fun changeReminderDefault(v: Int) { reminderDefault=v; prefs.edit().putInt("reminder_default",v).apply() }
    fun changeQuietEnabled(v: Boolean) { quietEnabled=v; prefs.edit().putBoolean("quiet_enabled",v).apply() }
    fun setQuiet(start: String, end: String) { quietStart=start; quietEnd=end; prefs.edit().putString("quiet_start",start).putString("quiet_end",end).apply() }
    fun finishOnboarding() { onboarded=true; prefs.edit().putBoolean("onboarded",true).apply() }
    fun persistAndReschedule() { save(); ReminderScheduler.rescheduleAll(context, tasks.toList()) }
}

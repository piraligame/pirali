package ge.weeklyplus.app

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import java.time.*

object ReminderScheduler {
    private const val CHANNEL = "weeklyplus_tasks"
    private fun pending(context: Context, id: String, flags: Int): PendingIntent {
        val intent = Intent(context, ReminderReceiver::class.java).putExtra("task_id", id)
        return PendingIntent.getBroadcast(context, id.hashCode(), intent, flags or PendingIntent.FLAG_IMMUTABLE)
    }
    fun channel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL, "დღიური • შეხსენებები", NotificationManager.IMPORTANCE_DEFAULT)
            context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }
    fun rescheduleAll(context: Context, tasks: List<PlanTask>) {
        val alarm = context.getSystemService(AlarmManager::class.java)
        tasks.forEach { t ->
            alarm.cancel(pending(context, t.id, PendingIntent.FLAG_UPDATE_CURRENT))
            scheduleOne(context, t)
        }
        // Cancel deleted task alarms too, using the prior set of stored identifiers.
        val prefs = context.getSharedPreferences("weeklyplus_alarms", Context.MODE_PRIVATE)
        val old = prefs.getStringSet("ids", emptySet()) ?: emptySet()
        val current = tasks.map { it.id }.toSet()
        (old-current).forEach { alarm.cancel(pending(context, it, PendingIntent.FLAG_UPDATE_CURRENT)) }
        prefs.edit().putStringSet("ids", current).apply()
    }
    fun scheduleOne(context: Context, t: PlanTask) {
        val time = taskTime(t) ?: return
        if (t.reminder < 0) return
        val zone = ZoneId.systemDefault()
        val now = ZonedDateTime.now(zone)
        val start = LocalDate.now(zone)
        val alarm = context.getSystemService(AlarmManager::class.java)
        for (i in 0..370) {
            val date = start.plusDays(i.toLong())
            if (!occurrence(t,date) || taskComplete(t,date)) continue
            val at = date.atTime(time).atZone(zone).minusMinutes(t.reminder.toLong())
            if (at.isAfter(now)) {
                // Inexact alarm; no restricted SCHEDULE_EXACT_ALARM permission required.
                alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at.toInstant().toEpochMilli(), pending(context,t.id,PendingIntent.FLAG_UPDATE_CURRENT))
                return
            }
        }
    }
    fun isQuiet(context: Context): Boolean {
        val p = context.getSharedPreferences("weeklyplus_v1", Context.MODE_PRIVATE)
        if (!p.getBoolean("quiet_enabled", false)) return false
        val start = runCatching { LocalTime.parse(p.getString("quiet_start", "22:00")) }.getOrNull() ?: return false
        val end = runCatching { LocalTime.parse(p.getString("quiet_end", "08:00")) }.getOrNull() ?: return false
        val now = LocalTime.now()
        return if (start <= end) now >= start && now < end else now >= start || now < end
    }
    fun notify(context: Context, t: PlanTask) {
        if (isQuiet(context)) return
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        DiaryWords.code = context.getSharedPreferences("weeklyplus_v1",Context.MODE_PRIVATE)
            .getString("language", if(context.getSharedPreferences("weeklyplus_v1",Context.MODE_PRIVATE).getBoolean("english",false))"en" else "ka") ?: "ka"
        channel(context)
        val manager = context.getSystemService(NotificationManager::class.java)
        val open = PendingIntent.getActivity(context, t.id.hashCode(), Intent(context, MainActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val snooze = PendingIntent.getBroadcast(context, t.id.hashCode(), Intent(context,ReminderActionReceiver::class.java).setAction("snooze").putExtra("task_id",t.id), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val done = PendingIntent.getBroadcast(context, t.id.hashCode(), Intent(context,ReminderActionReceiver::class.java).setAction("done").putExtra("task_id",t.id), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val note = Notification.Builder(context, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("${DiaryWords.appName()} • ${t.title}")
            .setContentText(if (t.time.isEmpty()) DiaryWords.noTime() else DiaryWords.reminderAt(t.time))
            .setContentIntent(open).setAutoCancel(true)
            .addAction(Notification.Action.Builder(null, DiaryWords.finishedLabel(), done).build())
            .addAction(Notification.Action.Builder(null, DiaryWords.snoozeLabel(), snooze).build())
            .build()
        manager.notify(t.id.hashCode(), note)
    }
}
class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra("task_id") ?: return
        val store = PlannerStore(context)
        val task = store.tasks.firstOrNull { it.id == id } ?: return
        ReminderScheduler.notify(context,task)
        ReminderScheduler.scheduleOne(context,task)
    }
}
class ReminderActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra("task_id") ?: return
        val store = PlannerStore(context)
        val task = store.tasks.firstOrNull { it.id == id } ?: return
        when (intent.action) {
            "done" -> store.toggleTask(task, LocalDate.now())
            "snooze" -> {
                val alarm = context.getSystemService(AlarmManager::class.java)
                val pi = PendingIntent.getBroadcast(context, id.hashCode(), Intent(context, ReminderReceiver::class.java).putExtra("task_id",id), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis()+600_000,pi)
            }
        }
        context.getSystemService(NotificationManager::class.java).cancel(id.hashCode())
    }
}
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            ReminderScheduler.rescheduleAll(context, PlannerStore(context).tasks.toList())
        }
    }
}

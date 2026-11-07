package ge.weeklyplus.app

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.os.Build
import android.provider.Settings
import java.time.LocalDateTime
import java.time.ZoneId

/** Independent persistent alarm and timer, without changing planner data. */
object DiaryClockScheduler {
    private const val P="diary_clock_v1"
    private const val CH="diary_clock_alerts_v1"
    private fun pref(c:Context)=c.getSharedPreferences(P,Context.MODE_PRIVATE)
    fun timerUntil(c:Context)=pref(c).getLong("timer_until",0)
    fun alarmEnabled(c:Context)=pref(c).getBoolean("alarm_enabled",false)
    fun alarmHour(c:Context)=pref(c).getInt("alarm_hour",8)
    fun alarmMinute(c:Context)=pref(c).getInt("alarm_minute",0)
    fun alarmLabel(c:Context)=pref(c).getString("alarm_label","მაღვიძარა")?:"მაღვიძარა"
    fun nextAlarmAt(c:Context)=pref(c).getLong("alarm_next",0)

    private fun pending(c:Context,type:String)=PendingIntent.getBroadcast(
        c,if(type=="timer")67001 else 67002,
        Intent(c,DiaryClockReceiver::class.java).putExtra("type",type),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    fun channel(c:Context) {
        val ch=NotificationChannel(CH,"დღიური • მაღვიძარა და ტაიმერი",NotificationManager.IMPORTANCE_HIGH).apply {
            enableVibration(true)
            setSound(Settings.System.DEFAULT_ALARM_ALERT_URI,AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build())
        }
        c.getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
    }
    private fun schedule(c:Context,type:String,at:Long) {
        val open=PendingIntent.getActivity(c,67003,Intent(c,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val manager=c.getSystemService(AlarmManager::class.java)
        if(Build.VERSION.SDK_INT>=31 && !manager.canScheduleExactAlarms()) {
            // User has not enabled special access: provide a safe approximate fallback.
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,pending(c,type))
        } else manager.setAlarmClock(AlarmManager.AlarmClockInfo(at,open),pending(c,type))
    }
    fun startTimer(c:Context,seconds:Long) {
        require(seconds in 1..604800)
        cancelTimer(c)
        val at=System.currentTimeMillis()+seconds*1000
        pref(c).edit().putLong("timer_until",at).apply()
        schedule(c,"timer",at)
    }
    fun cancelTimer(c:Context) {
        c.getSystemService(AlarmManager::class.java).cancel(pending(c,"timer"))
        pref(c).edit().remove("timer_until").apply()
    }
    private fun next(hour:Int,minute:Int):Long {
        val now=LocalDateTime.now()
        val at=now.withHour(hour).withMinute(minute).withSecond(0).withNano(0)
        return (if(at.isAfter(now))at else at.plusDays(1)).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
    }
    fun setDailyAlarm(c:Context,h:Int,m:Int,label:String) {
        require(h in 0..23&&m in 0..59)
        cancelDailyAlarm(c)
        pref(c).edit().putBoolean("alarm_enabled",true).putInt("alarm_hour",h).putInt("alarm_minute",m)
            .putString("alarm_label",label.take(80)).apply()
        scheduleNext(c)
    }
    private fun scheduleNext(c:Context) {
        if(!alarmEnabled(c))return
        val at=next(alarmHour(c),alarmMinute(c))
        pref(c).edit().putLong("alarm_next",at).apply()
        schedule(c,"alarm",at)
    }
    fun cancelDailyAlarm(c:Context) {
        c.getSystemService(AlarmManager::class.java).cancel(pending(c,"alarm"))
        pref(c).edit().putBoolean("alarm_enabled",false).remove("alarm_next").apply()
    }
    fun fire(c:Context,type:String) {
        val title=if(type=="timer")"დღიური • ტაიმერი" else "დღიური • მაღვიძარა"
        val message=if(type=="timer")"ტაიმერი დასრულდა" else alarmLabel(c)
        if(type=="timer") {
            if(timerUntil(c)==0L)return
            pref(c).edit().remove("timer_until").apply()
        } else {
            if(type!="alarm"||!alarmEnabled(c))return
            scheduleNext(c)
        }
        if(Build.VERSION.SDK_INT>=33&&c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return
        channel(c)
        val tap=PendingIntent.getActivity(c,67010,Intent(c,MainActivity::class.java),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n=Notification.Builder(c,CH).setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title).setContentText(message).setCategory(Notification.CATEGORY_ALARM)
            .setAutoCancel(true).setContentIntent(tap).build()
        c.getSystemService(NotificationManager::class.java).notify(if(type=="timer")67001 else 67002,n)
    }
    fun restore(c:Context) {
        val at=timerUntil(c)
        if(at>System.currentTimeMillis())schedule(c,"timer",at)
        else if(at!=0L)pref(c).edit().remove("timer_until").apply()
        if(alarmEnabled(c))scheduleNext(c)
    }
}
class DiaryClockReceiver:BroadcastReceiver() {
    override fun onReceive(c:Context,i:Intent){DiaryClockScheduler.fire(c,i.getStringExtra("type")?:"")}
}

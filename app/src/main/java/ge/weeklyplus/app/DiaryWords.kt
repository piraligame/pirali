package ge.weeklyplus.app

import androidx.compose.runtime.*
import java.util.Locale

/** App language, independent of the phone's system locale. */
object DiaryWords {
    val languages = listOf(
        "ka" to "🇬🇪 ქართული",
        "ru" to "🇷🇺 Русский",
        "en" to "🇬🇧 English",
        "zh" to "🇨🇳 简体中文",
        "es" to "🇪🇸 Español",
        "de" to "🇩🇪 Deutsch",
        "fr" to "🇫🇷 Français"
    )
    var code by mutableStateOf("ka")
    fun languageLabel(value: String) = languages.firstOrNull { it.first == value }?.second ?: languages.first().second
    fun locale(): Locale = when (code) {
        "ru" -> Locale.forLanguageTag("ru-RU")
        "en" -> Locale.ENGLISH
        "zh" -> Locale.forLanguageTag("zh-CN")
        "es" -> Locale.forLanguageTag("es-ES")
        "de" -> Locale.forLanguageTag("de-DE")
        "fr" -> Locale.FRANCE
        else -> Locale.forLanguageTag("ka-GE")
    }
    private val translations: Map<String, List<String>> = """
Your days, beautifully planned|Твои дни — красиво спланированы|让每一天井井有条|Tus días, bien organizados|Deine Tage, schön geplant|Vos journées, bien organisées
Welcome to Diary|Добро пожаловать в Дневник|欢迎使用日记|Bienvenido a Diario|Willkommen bei Tagebuch|Bienvenue dans Journal
Your plans stay private and on this phone. Choose a default reminder rule. You can change it later.|Планы хранятся только на этом телефоне. Выберите время напоминания. Его можно изменить позже.|计划仅保存在此手机上。请选择默认提醒时间，之后可以修改。|Tus planes se guardan solo en este teléfono. Elige un recordatorio predeterminado. Podrás cambiarlo.|Deine Pläne bleiben auf diesem Handy. Wähle eine Standarderinnerung; du kannst sie später ändern.|Vos projets restent sur ce téléphone. Choisissez un rappel par défaut, modifiable ensuite.
Off until I enable|Выключено, пока не включу|暂不提醒|Desactivado hasta activarlo|Aus, bis ich es aktiviere|Désactivé jusqu'à activation
15 min before|За 15 минут|提前 15 分钟|15 min antes|15 Min. vorher|15 min avant
At the start time|В назначенное время|开始时|A la hora de inicio|Zur Startzeit|À l'heure prévue
Start planning|Начать планирование|开始规划|Empezar a planificar|Planung starten|Commencer à planifier
Today|Сегодня|今天|Hoy|Heute|Aujourd'hui
Calendar|Календарь|日历|Calendario|Kalender|Calendrier
Goals|Цели|目标|Objetivos|Ziele|Objectifs
Results|Результаты|统计|Resultados|Ergebnisse|Résultats
Settings|Настройки|设置|Ajustes|Einstellungen|Paramètres
My day|Мой день|我的一天|Mi día|Mein Tag|Ma journée
Focus on what matters|Сосредоточьтесь на главном|专注重要事项|Concéntrate en lo importante|Konzentriere dich auf das Wesentliche|Concentrez-vous sur l'essentiel
Tap a star on any task to choose your priorities.|Нажмите звезду рядом с задачей, чтобы выбрать главное.|点击任务旁的星标，选出优先事项。|Toca la estrella de una tarea para marcarla como prioritaria.|Tippe bei einer Aufgabe auf den Stern, um Prioritäten zu wählen.|Touchez l'étoile d'une tâche pour définir vos priorités.
Hourly schedule|Расписание по часам|小时日程|Horario por horas|Stundenplan|Planning horaire
Search tasks|Поиск задач|搜索任务|Buscar tareas|Aufgaben suchen|Rechercher des tâches
All|Все|全部|Todas|Alle|Toutes
To do|Предстоит|待办|Pendientes|Offen|À faire
Done|Выполнено|已完成|Hecho|Erledigt|Terminé
No tasks yet. Make your first plan!|Пока нет задач. Добавьте первую!|暂无任务，创建第一个计划吧！|Aún no hay tareas. ¡Crea la primera!|Noch keine Aufgaben. Erstelle deinen ersten Plan!|Pas encore de tâches. Créez votre premier projet !
No matches for this filter|По этому фильтру ничего не найдено|没有符合条件的任务|No hay tareas con este filtro|Keine passenden Aufgaben|Aucune tâche ne correspond à ce filtre
TOP 3 is full. Unstar a task first.|В ТОП-3 уже три задачи. Сначала снимите звезду с одной.|前三项已满，请先取消一项的星标。|El TOP 3 está completo. Quita primero una estrella.|Die TOP 3 sind voll. Entferne zuerst einen Stern.|Le TOP 3 est plein. Retirez d'abord une étoile.
See your plans at a glance|Все планы как на ладони|快速查看计划|Consulta tus planes de un vistazo|Deine Pläne auf einen Blick|Vos projets en un coup d'œil
Day|День|日|Día|Tag|Jour
Week|Неделя|周|Semana|Woche|Semaine
Month|Месяц|月|Mes|Monat|Mois
Tasks for selected day|Задачи на выбранный день|所选日期的任务|Tareas del día seleccionado|Aufgaben für den gewählten Tag|Tâches du jour sélectionné
No tasks|Нет задач|没有任务|Sin tareas|Keine Aufgaben|Aucune tâche
My goals|Мои цели|我的目标|Mis objetivos|Meine Ziele|Mes objectifs
Big things, small steps|Большие цели — маленькие шаги|大目标，小步前进|Grandes metas, pequeños pasos|Große Ziele, kleine Schritte|Grands objectifs, petits pas
Set a goal and link tasks to it to track your progress.|Создайте цель и привяжите к ней задачи, чтобы видеть прогресс.|创建目标并关联任务，跟踪进度。|Crea un objetivo y vincula tareas para seguir el progreso.|Erstelle ein Ziel und verknüpfe Aufgaben, um deinen Fortschritt zu sehen.|Créez un objectif et associez-lui des tâches pour suivre vos progrès.
Delete goal|Удалить цель|删除目标|Eliminar objetivo|Ziel löschen|Supprimer l'objectif
Delete goal?|Удалить цель?|删除目标？|¿Eliminar objetivo?|Ziel löschen?|Supprimer l'objectif ?
Linked tasks will remain.|Связанные задачи сохранятся.|关联任务将保留。|Las tareas vinculadas se conservarán.|Verknüpfte Aufgaben bleiben erhalten.|Les tâches associées seront conservées.
Delete|Удалить|删除|Eliminar|Löschen|Supprimer
Cancel|Отмена|取消|Cancelar|Abbrechen|Annuler
My results|Мои результаты|我的成果|Mis resultados|Meine Ergebnisse|Mes résultats
Last 7 days|Последние 7 дней|最近 7 天|Últimos 7 días|Letzte 7 Tage|7 derniers jours
Completed|Выполнено|已完成|Completadas|Erledigt|Terminées
Completion|Выполнение|完成率|Cumplimiento|Erfüllung|Achèvement
Daily progress|Прогресс по дням|每日进度|Progreso diario|Tagesfortschritt|Progression quotidienne
Your week|Ваша неделя|本周总结|Tu semana|Deine Woche|Votre semaine
Add tasks to start seeing results.|Добавьте задачи, чтобы увидеть результаты.|添加任务即可查看统计结果。|Añade tareas para ver resultados.|Füge Aufgaben hinzu, um Ergebnisse zu sehen.|Ajoutez des tâches pour voir les résultats.
Make Diary yours|Настройте Дневник под себя|个性化日记|Personaliza Diario|Passe Tagebuch an|Personnalisez Journal
Dark mode|Тёмная тема|深色模式|Modo oscuro|Dunkelmodus|Mode sombre
Language|Язык|语言|Idioma|Sprache|Langue
Reminder defaults|Напоминания по умолчанию|默认提醒|Recordatorios predeterminados|Standarderinnerungen|Rappels par défaut
Off until enabled|Выключено до включения|未启用|Desactivado hasta activarlo|Aus, bis aktiviert|Désactivés jusqu'à activation
At task time|В начале задачи|任务开始时|A la hora de la tarea|Zur Aufgabenzeit|À l'heure de la tâche
5 minutes early|За 5 минут|提前 5 分钟|5 minutos antes|5 Minuten vorher|5 minutes avant
15 minutes early|За 15 минут|提前 15 分钟|15 minutos antes|15 Minuten vorher|15 minutes avant
30 minutes early|За 30 минут|提前 30 分钟|30 minutos antes|30 Minuten vorher|30 minutes avant
1 day before|За 1 день|提前 1 天|1 día antes|1 Tag vorher|1 jour avant
Existing tasks keep their own reminders.|У существующих задач настройки напоминаний сохраняются.|已有任务保留各自的提醒设置。|Las tareas existentes conservan sus recordatorios.|Bestehende Aufgaben behalten ihre Erinnerungen.|Les tâches existantes conservent leurs rappels.
Enable phone notifications|Включить уведомления|启用手机通知|Activar notificaciones|Handybenachrichtigungen aktivieren|Activer les notifications
Reminders can arrive later due to Android battery rules; exact alarms are not requested.|Из-за экономии заряда Android уведомления могут задерживаться.|由于 Android 省电机制，提醒可能延迟。|Los avisos pueden retrasarse por el ahorro de batería de Android.|Androids Energiesparen kann Erinnerungen verzögern.|L'économie d'énergie d'Android peut retarder les rappels.
Quiet hours|Тихие часы|免打扰时段|Horas de silencio|Ruhezeiten|Heures calmes
Quiet hours suppress, not postpone, reminders.|В тихие часы напоминания отменяются, а не откладываются.|免打扰时段内不会发送提醒，也不会延后。|Las horas de silencio suprimen los avisos, no los posponen.|In Ruhezeiten werden Erinnerungen unterdrückt, nicht verschoben.|Les heures calmes suppriment les rappels sans les reporter.
Data & privacy|Данные и конфиденциальность|数据与隐私|Datos y privacidad|Daten und Datenschutz|Données et confidentialité
Everything is saved locally on your phone. No account, ads or analytics tracking.|Всё хранится на телефоне. Нет регистрации, рекламы и слежения.|所有数据仅保存在手机上，无需账号、无广告、无跟踪。|Todo se guarda en tu móvil. Sin cuenta, anuncios ni seguimiento.|Alles bleibt auf deinem Handy. Kein Konto, keine Werbung, kein Tracking.|Tout reste sur votre téléphone, sans compte, publicité ni suivi.
Backup export and cloud sync are planned for later releases.|Экспорт копии и синхронизация появятся в будущих версиях.|备份导出和云同步将在后续版本提供。|La exportación y sincronización llegarán en futuras versiones.|Backup-Export und Cloud-Synchronisierung sind für später geplant.|L'exportation et la synchronisation cloud sont prévues plus tard.
Pick an hour|Выберите час|选择小时|Elige una hora|Stunde wählen|Choisir une heure
Minutes|Минуты|分钟|Minutos|Minuten|Minutes
Exact minute:|Точные минуты:|精确分钟：|Minuto exacto:|Genaue Minute:|Minute exacte :
New task|Новая задача|新任务|Nueva tarea|Neue Aufgabe|Nouvelle tâche
Edit task|Изменить задачу|编辑任务|Editar tarea|Aufgabe bearbeiten|Modifier la tâche
Title|Название|标题|Título|Titel|Titre
Choose time|Выбрать время|选择时间|Elegir hora|Zeit wählen|Choisir l'heure
Duration (optional)|Длительность (необязательно)|时长（可选）|Duración (opcional)|Dauer (optional)|Durée (facultatif)
None|Нет|无|Ninguna|Keine|Aucune
Daily|Ежедневно|每天|Diario|Täglich|Quotidien
Weekly|Еженедельно|每周|Semanal|Wöchentlich|Hebdomadaire
Monthly|Ежемесячно|每月|Mensual|Monatlich|Mensuel
Once|Однократно|仅一次|Una vez|Einmalig|Une fois
No reminder|Без напоминания|不提醒|Sin recordatorio|Keine Erinnerung|Sans rappel
Off|Выключено|关闭|Desactivado|Aus|Désactivé
At start|В начале|开始时|Al empezar|Zum Beginn|Au début
No linked goal|Нет связанной цели|未关联目标|Sin objetivo vinculado|Kein verknüpftes Ziel|Aucun objectif associé
No goal|Без цели|无目标|Sin objetivo|Kein Ziel|Sans objectif
Notes (optional)|Заметки (необязательно)|备注（可选）|Notas (opcional)|Notizen (optional)|Notes (facultatif)
Task duplicated|Задача скопирована|已复制任务|Tarea duplicada|Aufgabe dupliziert|Tâche dupliquée
Duplicate|Дублировать|复制|Duplicar|Duplizieren|Dupliquer
Delete task|Удалить задачу|删除任务|Eliminar tarea|Aufgabe löschen|Supprimer la tâche
Enter a title|Введите название|请输入标题|Escribe un título|Titel eingeben|Saisissez un titre
Choose a time for this reminder|Укажите время для напоминания|请为提醒选择时间|Elige una hora para el recordatorio|Wähle eine Uhrzeit für die Erinnerung|Choisissez l'heure du rappel
Task saved|Задача сохранена|任务已保存|Tarea guardada|Aufgabe gespeichert|Tâche enregistrée
Save|Сохранить|保存|Guardar|Speichern|Enregistrer
Delete task?|Удалить задачу?|删除任务？|¿Eliminar tarea?|Aufgabe löschen?|Supprimer la tâche ?
New goal|Новая цель|新目标|Nuevo objetivo|Neues Ziel|Nouvel objectif
Goal title|Название цели|目标名称|Nombre del objetivo|Zielname|Nom de l'objectif
Target count|Целевое количество|目标次数|Cantidad objetivo|Zielanzahl|Nombre cible
Link tasks to this goal when creating or editing a task.|Привязывайте задачи к цели при создании или редактировании.|创建或编辑任务时可将其关联到此目标。|Vincula tareas a este objetivo al crearlas o editarlas.|Verknüpfe Aufgaben beim Erstellen oder Bearbeiten mit diesem Ziel.|Associez des tâches à cet objectif lors de leur création ou modification.
Create|Создать|创建|Crear|Erstellen|Créer
Work|Работа|工作|Trabajo|Arbeit|Travail
Personal|Личное|个人|Personal|Privat|Personnel
Health|Здоровье|健康|Salud|Gesundheit|Santé
Study|Учёба|学习|Estudios|Lernen|Études
Shopping|Покупки|购物|Compras|Einkaufen|Achats
Other|Другое|其他|Otros|Sonstiges|Autre
Notifications enabled|Уведомления включены|通知已启用|Notificaciones activadas|Benachrichtigungen aktiviert|Notifications activées
Notification permission denied|Нет разрешения на уведомления|通知权限已拒绝|Permiso de notificaciones denegado|Benachrichtigungserlaubnis verweigert|Autorisation des notifications refusée
Notifications available|Уведомления доступны|通知可用|Notificaciones disponibles|Benachrichtigungen verfügbar|Notifications disponibles
    """.trimIndent().lineSequence().filter { it.isNotBlank() }.mapNotNull { line ->
        val parts = line.split('|')
        if (parts.size == 6) parts[0] to parts.drop(1) else null
    }.toMap()
    fun word(georgian: String, english: String): String = when(code) {
        "ka" -> georgian
        "en" -> english
        else -> translations[english]?.getOrNull(when(code) {
            "ru" -> 0; "zh" -> 1; "es" -> 2; "de" -> 3; "fr" -> 4; else -> 0
        }) ?: english
    }
    fun appName(): String = when(code) {
        "ru" -> "Дневник"; "en" -> "Diary"; "zh" -> "日记"
        "es" -> "Diario"; "de" -> "Tagebuch"; "fr" -> "Journal"; else -> "დღიური"
    }
    fun duration(minutes:Int):String {
        if(minutes==0) return word("გარეშე","None")
        val hours=minutes/60; val mins=minutes%60
        val hm=when(code) {
            "ka" -> "სთ" to "წთ"; "ru" -> "ч" to "мин"; "zh" -> "小时" to "分"
            "es" -> "h" to "min"; "de" -> "Std." to "Min."; "fr" -> "h" to "min"
            else -> "h" to "min"
        }
        return if(hours==0) "$minutes ${hm.second}" else if(mins==0) "$hours ${hm.first}" else "$hours ${hm.first} $mins ${hm.second}"
    }
    fun minutesBefore(minutes:Int):String = when(code) {
        "ka" -> "$minutes წუთით ადრე"; "ru" -> "За $minutes мин"; "zh" -> "提前 $minutes 分钟"
        "es" -> "$minutes min antes"; "de" -> "$minutes Min. vorher"; "fr" -> "$minutes min avant"
        else -> "$minutes min before"
    }
    fun reminderAhead(minutes:Int):String = when(code) {
        "ka" -> "შეხსენება: $minutes წთ ადრე"; "ru" -> "Напоминание: за $minutes мин"; "zh" -> "提醒：提前 $minutes 分钟"
        "es" -> "Recordatorio: $minutes min antes"; "de" -> "Erinnerung: $minutes Min. vorher"; "fr" -> "Rappel : $minutes min avant"
        else -> "Reminder: $minutes min early"
    }
    fun weekSummary(done:Int,total:Int):String = when(code) {
        "ka" -> "ბოლო 7 დღეში შეასრულე $done საქმე, დაგეგმილი $total-დან."
        "ru" -> "За последние 7 дней выполнено $done задач из $total."
        "zh" -> "最近 7 天完成了 $done / $total 项任务。"
        "es" -> "En los últimos 7 días completaste $done de $total tareas."
        "de" -> "In den letzten 7 Tagen hast du $done von $total Aufgaben erledigt."
        "fr" -> "Au cours des 7 derniers jours, vous avez terminé $done tâches sur $total."
        else -> "You completed $done of $total planned tasks in the last 7 days."
    }
    fun noTime():String = when(code) {
        "ru"->"Запланированное дело"; "en"->"Your planned task"; "zh"->"您的计划任务"
        "es"->"Tu tarea programada"; "de"->"Deine geplante Aufgabe"; "fr"->"Votre tâche programmée"
        else->"შენი დაგეგმილი საქმე"
    }
    fun reminderAt(time:String):String = when(code) {
        "ru"->"Запланировано на $time"; "en"->"Scheduled for $time"; "zh"->"计划时间：$time"
        "es"->"Programado a las $time"; "de"->"Geplant um $time"; "fr"->"Prévu à $time"
        else->"დაგეგმილია $time-ზე"
    }
    fun finishedLabel():String = "✓ "+word("შესრულებულია","Completed")
    fun snoozeLabel():String = when(code) {
        "ru"->"↻ +10 мин"; "zh"->"↻ 10 分钟后"; "de"->"↻ +10 Min."; "fr"->"↻ +10 min"
        else->"↻ +10 min"
    }
}
fun tr(georgian:String, english:String):String = DiaryWords.word(georgian,english)

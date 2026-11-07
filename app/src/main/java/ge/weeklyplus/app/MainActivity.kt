package ge.weeklyplus.app

import android.Manifest
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import java.time.*
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

private val Pine = Color(0xFF197E65)
private val DarkPine = Color(0xFF173D31)
private val Mint = Color(0xFFE5F4E9)
private val OffWhite = Color(0xFFF8FAF7)
private val Amber = Color(0xFFF1B94D)
private val MaterialShape = RoundedCornerShape(20.dp)
private val ca = Locale.forLanguageTag("ka-GE")
private val en = Locale.ENGLISH

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ReminderScheduler.channel(this)
        setContent { WeeklyApp() }
    }
}

@Composable
private fun WeeklyApp() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val store = remember { PlannerStore(context.applicationContext) }
    LaunchedEffect(store.onboarded) { if (!store.onboarded) store.finishOnboarding() }
    DiaryWords.code = store.language
    val lang = store.english
    val colors = if (store.dark) darkColorScheme(primary = Color(0xFF79D9AF), secondary = Color(0xFF9BCDB5), background = Color(0xFF12241D), surface = Color(0xFF1D3228), surfaceVariant = Color(0xFF294639))
        else lightColorScheme(primary = Pine, secondary = DarkPine, background = OffWhite, surface = Color.White, surfaceVariant = Mint)
    var page by remember { mutableStateOf("home") }
    var view by remember { mutableStateOf("day") }
    var date by remember { mutableStateOf(LocalDate.now()) }
    var editing by remember { mutableStateOf<PlanTask?>(null) }
    var creating by remember { mutableStateOf(false) }
    var newGoal by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf("") }
    var search by remember { mutableStateOf("") }
    var categoryFilter by remember { mutableStateOf("all") }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        notice = if (granted) tr("შეტყობინებები ჩართულია","Notifications enabled") else tr("შეტყობინებებზე ნებართვა არ გაიცა","Notification permission denied")
    }
    fun askPermission() {
        if (Build.VERSION.SDK_INT >= 33) permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        else notice = tr("შეტყობინებები ხელმისაწვდომია","Notifications available")
    }
    MaterialTheme(colorScheme = colors, typography = Typography()) {
        BoxWithConstraints(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
            val tablet = maxWidth >= 650.dp
            Row(Modifier.fillMaxSize()) {
                if (tablet) {
                    NavigationRail(containerColor = MaterialTheme.colorScheme.surface) {
                        Spacer(Modifier.height(18.dp))
                        NavItems(page, lang) { page = it }
                    }
                    VerticalDivider()
                }
                Scaffold(
                    modifier = Modifier.weight(1f),
                    containerColor = MaterialTheme.colorScheme.background,
                    bottomBar = { if (!tablet) NavigationBar(containerColor = MaterialTheme.colorScheme.surface) { NavItems(page,lang) { page=it } } },
                    snackbarHost = { if (notice.isNotEmpty()) SnackbarHost(hostState = remember { SnackbarHostState() }) }
                ) { insets ->
                    Column(Modifier.fillMaxSize().padding(insets).padding(horizontal = if (tablet) 26.dp else 16.dp)) {
                        Row(Modifier.fillMaxWidth().padding(top = 14.dp, bottom = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(46.dp).background(Brush.linearGradient(listOf(Color(0xFF126850),Color(0xFF29AB88))), RoundedCornerShape(16.dp)), contentAlignment = Alignment.Center) { Text("✓", color=Color.White, fontSize=23.sp, fontWeight=FontWeight.Bold) }
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text(DiaryWords.appName(), style=MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                                Text(tr("შენი დღეები, ლამაზად დაგეგმილი","Your days, beautifully planned"), style=MaterialTheme.typography.labelSmall, color=MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text("α 0.04", style=MaterialTheme.typography.labelSmall, color=MaterialTheme.colorScheme.primary)
                        }
                        if (notice.isNotEmpty()) {
                            Surface(color=Mint,shape=RoundedCornerShape(12.dp)) {
                                Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment=Alignment.CenterVertically) {
                                    Text(notice,Modifier.weight(1f), color=DarkPine, fontSize=12.sp)
                                    Text("✕", Modifier.clickable { notice="" }.padding(5.dp), color=DarkPine)
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                        }
                        Box(Modifier.weight(1f).widthIn(max=940.dp).fillMaxWidth()) {
                            when(page) {
                                "home" -> HomeScreen(store,date,{date=it}, { creating=true }, { editing=it }, { notice=it })
                                "calendar" -> CalendarScreen(store,date,{date=it},view,{view=it},{creating=true},{editing=it},{notice=it})
                                "goals" -> GoalsScreen(store,{newGoal=true},{editing=it})
                                "insights" -> InsightsScreen(store)
                                "settings" -> SettingsScreen(store,::askPermission) { notice=it }
                            }
                        }
                    }
                }
            }
        }
        if (creating || editing!=null) TaskDialog(store, editing, date, onClose={ creating=false; editing=null }, onInfo={notice=it})
        if (newGoal) GoalDialog(store) { newGoal=false }

    }
}

@Composable
private fun NavItems(current:String, english:Boolean, onChange:(String)->Unit) {
    val tabs = listOf(Triple("home","⌂",tr("დღეს","Today")), Triple("calendar","▦",tr("კალენდარი","Calendar")), Triple("goals","◎",tr("მიზნები","Goals")), Triple("insights","▥",tr("შედეგები","Results")), Triple("settings","⚙",tr("პარამეტრები","Settings")))
    tabs.forEach { (key,icon,label) ->
        val selected = current==key
        // NavigationBarItem is only used inside NavigationBar; NavigationRailItem works only inside NavigationRail.
        // Plain clickable nav item works reliably in both normal and wide layouts.
        Column(
            modifier=Modifier.padding(horizontal=3.dp).clickable {onChange(key)}.padding(vertical=7.dp,horizontal=3.dp),
            horizontalAlignment=Alignment.CenterHorizontally
        ) {
            Surface(color=if(selected) Mint else Color.Transparent, shape=RoundedCornerShape(20.dp)) {
                Text(icon,Modifier.padding(horizontal=15.dp,vertical=4.dp),fontSize=22.sp,color=if(selected) Pine else MaterialTheme.colorScheme.onSurface)
            }
            Text(label,fontSize=9.sp,fontWeight=if(selected) FontWeight.Bold else FontWeight.Normal,maxLines=1,color=if(selected) Pine else MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun Heading(title:String,subtitle:String="",action:String?=null,onAction:(()->Unit)?=null) {
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title,fontWeight=FontWeight.Bold,fontSize=23.sp)
            if(subtitle.isNotEmpty()) Text(subtitle,color=MaterialTheme.colorScheme.onSurfaceVariant,fontSize=12.sp)
        }
        if(action!=null && onAction!=null) FilledTonalButton(onClick=onAction){Text(action)}
    }
}
@Composable private fun Panel(content:@Composable ColumnScope.()->Unit) {
    Surface(shape=RoundedCornerShape(22.dp),color=MaterialTheme.colorScheme.surface,tonalElevation=1.dp,border=BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant.copy(alpha=.55f)), modifier=Modifier.fillMaxWidth()) {
        Column(Modifier.padding(17.dp),verticalArrangement=Arrangement.spacedBy(12.dp),content=content)
    }
}
@Composable private fun Tag(text:String,highlight:Boolean=false) {
    Surface(color=if(highlight) Mint else MaterialTheme.colorScheme.surfaceVariant,shape=RoundedCornerShape(10.dp)) { Text(text,Modifier.padding(horizontal=9.dp,vertical=4.dp),color=if(highlight) DarkPine else MaterialTheme.colorScheme.onSurface,fontSize=11.sp) }
}
@Composable
private fun DateStrip(date:LocalDate,onDate:(LocalDate)->Unit,lang:Boolean,mode:String="day") {
    val prev: () -> Unit = { onDate(when(mode) {"week"->date.minusWeeks(1);"month"->date.minusMonths(1);"year"->date.minusYears(1);else->date.minusDays(1)}) }
    val next: () -> Unit = { onDate(when(mode) {"week"->date.plusWeeks(1);"month"->date.plusMonths(1);"year"->date.plusYears(1);else->date.plusDays(1)}) }
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
        TextButton(onClick=prev) { Text("‹",fontSize=25.sp) }
        Column(horizontalAlignment=Alignment.CenterHorizontally) {
            Text(when(mode) { "year"->date.year.toString(); "month"->date.format(DateTimeFormatter.ofPattern("LLLL yyyy",DiaryWords.locale()));else->date.format(DateTimeFormatter.ofPattern("d MMMM yyyy",DiaryWords.locale())) },fontWeight=FontWeight.Bold,fontSize=17.sp)
            Text(if(mode=="year") tr("12 თვის მიმოხილვა","12-month overview") else date.dayOfWeek.getDisplayName(TextStyle.FULL,DiaryWords.locale()),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        TextButton(onClick=next) { Text("›",fontSize=25.sp) }
        TextButton(onClick={onDate(LocalDate.now())}) { Text(tr("დღეს","Today"),fontSize=11.sp) }
    }
}
@Composable
private fun HomeScreen(store:PlannerStore,date:LocalDate,onDate:(LocalDate)->Unit,onAdd:()->Unit,onEdit:(PlanTask)->Unit,onInfo:(String)->Unit) {
    val lang=store.english
    val today = store.tasks.filter {occurrence(it,date)}.sortedWith(compareBy({if(it.time.isBlank())"99:99" else it.time},{it.title}))
    val top = today.filter {(it.priorities[date.toString()] ?: 0)>0}.sortedBy {it.priorities[date.toString()] ?: 0}
    var query by remember { mutableStateOf("") }
    var filter by remember { mutableStateOf("all") }
    var quickTitle by remember(date) { mutableStateOf("") }
    var sort by remember { mutableStateOf("time") }
    val overdue = store.tasks.filter { task ->
        task.repeat == "none" && runCatching { LocalDate.parse(task.date).isBefore(LocalDate.now()) }.getOrDefault(false) && !task.completed.contains(task.date)
    }.sortedBy { it.date }
    val shown = today.filter { t ->
        (query.isBlank() || t.title.contains(query,ignoreCase=true) || t.details.contains(query,ignoreCase=true)) &&
            (filter=="all" || (filter=="done" && taskComplete(t,date)) || (filter=="open" && !taskComplete(t,date)))
    }.let { list -> when(sort) {
        "name" -> list.sortedBy { it.title.lowercase(DiaryWords.locale()) }
        "status" -> list.sortedWith(compareBy({taskComplete(it,date)},{it.time.ifBlank { "99:99" }}))
        else -> list
    } }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(15.dp)) {
        Heading(tr("ჩემი დღე","My day"),tr("მთავარზე კონცენტრირდი","Focus on what matters"), "＋") { onAdd() }
        DateStrip(date,onDate,lang)
        Surface(shape=RoundedCornerShape(21.dp),color=MaterialTheme.colorScheme.surface,shadowElevation=1.dp,border=BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant.copy(alpha=.7f))) {
            Row(Modifier.fillMaxWidth().padding(9.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value=quickTitle,onValueChange={quickTitle=it},singleLine=true,
                    placeholder={Text(tr("სწრაფად დაამატე საქმე...","Quickly add a task..."),fontSize=12.sp)},
                    modifier=Modifier.weight(1f),shape=RoundedCornerShape(15.dp))
                FilledIconButton(onClick={store.addTask(PlanTask(title=quickTitle.trim(),date=date.toString()));quickTitle=""},enabled=quickTitle.isNotBlank()) {
                    Text("+",fontSize=24.sp)
                }
            }
        }
        if(date==LocalDate.now() && overdue.isNotEmpty()) Panel {
            Text(tr("დაგვიანებული საქმეები","Overdue tasks")+" · ${overdue.size}",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.error)
            overdue.take(4).forEach { t ->
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(t.title,maxLines=1,overflow=TextOverflow.Ellipsis,fontSize=13.sp,fontWeight=FontWeight.SemiBold)
                        Text(t.date,fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    TextButton(onClick={store.updateTask(t.copy(date=date.toString(),completed=t.completed-t.date))}) { Text(tr("დღეს გადმოტანა","Move to today"),fontSize=11.sp) }
                }
            }
        }
        Surface(shape=MaterialShape,color=if(store.dark) Color(0xFF254538) else Mint,modifier=Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Text("★  TOP 3",fontWeight=FontWeight.Bold,color=if(store.dark)Color.White else DarkPine,modifier=Modifier.weight(1f))
                    Text("${top.size}/3",color=Pine,fontWeight=FontWeight.Bold)
                }
                if(top.isEmpty()) Text(tr("დააჭირე ვარსკვლავს საქმეზე — სამეულს შენ თავად ირჩევ.","Tap a star on any task to choose your priorities."),fontSize=12.sp,color=if(store.dark)Color.White else DarkPine)
                top.forEachIndexed { i,t ->
                    Surface(color=MaterialTheme.colorScheme.surface, shape=RoundedCornerShape(12.dp)) {
                        Row(Modifier.fillMaxWidth().padding(10.dp),verticalAlignment=Alignment.CenterVertically) {
                            Text("${i+1}.",color=Pine,fontWeight=FontWeight.Bold)
                            Spacer(Modifier.width(10.dp))
                            Text(t.title,Modifier.weight(1f),maxLines=1,overflow=TextOverflow.Ellipsis,fontWeight=FontWeight.SemiBold)
                            Text(if(taskComplete(t,date))"✓" else "",color=Pine)
                            Text("▲",Modifier.clickable {store.movePriority(t,date,-1)}.padding(7.dp),color=Pine,fontSize=12.sp)
                            Text("▼",Modifier.clickable {store.movePriority(t,date,1)}.padding(7.dp),color=Pine,fontSize=12.sp)
                        }
                    }
                }
            }
        }
        Panel {
            Row(verticalAlignment=Alignment.CenterVertically) {
                Text(tr("საათობრივი განრიგი","Hourly schedule"),fontWeight=FontWeight.Bold,modifier=Modifier.weight(1f))
                Text("${today.count {taskComplete(it,date)}}/${today.size}",color=Pine,fontWeight=FontWeight.Bold)
            }
            if(today.isNotEmpty()) {
                Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(6.dp)) {
                    Text(tr("დალაგება:","Sort:"),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    listOf("time" to tr("დრო","Time"),"name" to tr("სახელი","Name"),"status" to tr("სტატუსი","Status")).forEach { (v,label) ->
                        FilterChip(selected=sort==v,onClick={sort=v},label={Text(label,fontSize=10.sp)})
                    }
                }
                LinearProgressIndicator(progress={today.count {taskComplete(it,date)}.toFloat()/today.size},modifier=Modifier.fillMaxWidth().height(6.dp),color=Pine,trackColor=Mint)
                OutlinedTextField(value=query,onValueChange={query=it},label={Text(tr("საქმის ძიება","Search tasks"))},singleLine=true,modifier=Modifier.fillMaxWidth())
                Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(6.dp)) {
                    listOf("all" to (tr("ყველა","All")),"open" to (tr("გასაკეთებელი","To do")),"done" to (tr("შესრულებული","Done"))).forEach { (id,label)->
                        FilterChip(selected=filter==id,onClick={filter=id},label={Text(label,fontSize=11.sp)})
                    }
                }
            }
            if(shown.isEmpty()) {
                Text(if(today.isEmpty()) (tr("ამ დღისთვის საქმე ჯერ არ არის. დაამატე პირველი გეგმა!","No tasks yet. Make your first plan!")) else (tr("ამ ფილტრში საქმე ვერ მოიძებნა","No matches for this filter")),color=MaterialTheme.colorScheme.onSurfaceVariant,fontSize=13.sp)
            } else shown.forEach { t -> TaskRow(t,date,store,onEdit,onInfo) }
        }
        if(date==LocalDate.now()) {
            val tomorrow=date.plusDays(1)
            val tomorrowCount=store.tasks.count { occurrence(it,tomorrow) && !taskComplete(it,tomorrow) }
            Surface(shape=MaterialShape,color=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.65f),modifier=Modifier.fillMaxWidth()) {
                Row(Modifier.padding(horizontal=14.dp,vertical=10.dp),verticalAlignment=Alignment.CenterVertically) {
                    Text(tr("ხვალ","Tomorrow")+" · $tomorrowCount ${tr("საქმე","tasks")}",Modifier.weight(1f),fontSize=13.sp,fontWeight=FontWeight.SemiBold)
                    TextButton(onClick={onDate(tomorrow)}){Text(tr("ნახვა","View"))}
                }
            }
        }
        Spacer(Modifier.height(14.dp))
    }
}

@Composable
private fun TaskRow(task:PlanTask,date:LocalDate,store:PlannerStore,onEdit:(PlanTask)->Unit,onInfo:(String)->Unit) {
    val done=taskComplete(task,date)
    val rank=task.priorities[date.toString()] ?: 0
    Row(Modifier.fillMaxWidth().padding(vertical=3.dp),verticalAlignment=Alignment.CenterVertically) {
        Checkbox(checked=done,onCheckedChange={store.toggleTask(task,date)},modifier=Modifier.size(40.dp))
        Spacer(Modifier.width(5.dp))
        Column(Modifier.weight(1f).clickable {onEdit(task)},verticalArrangement=Arrangement.spacedBy(3.dp)) {
            Text(task.title,fontWeight=FontWeight.Medium,fontSize=14.sp,color=if(done)MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,maxLines=2)
            Row(horizontalArrangement=Arrangement.spacedBy(5.dp),verticalAlignment=Alignment.CenterVertically) {
                if(task.time.isNotEmpty()) Text(if(task.durationMinutes>0) "${task.time}–${taskTime(task)?.plusMinutes(task.durationMinutes.toLong())?.format(DateTimeFormatter.ofPattern("HH:mm")) ?: task.time}" else task.time,color=Pine,fontSize=11.sp,fontWeight=FontWeight.Bold)
                Text(tr(task.category,categoryEn(task.category)),fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                if(task.repeat!="none") Text("↻",color=Pine,fontSize=12.sp)
                if(task.reminder>=0) Text("♩",color=Pine,fontSize=12.sp)
            }
        }
        Text(if(rank>0)"★" else "☆",Modifier.clickable {if(!store.togglePriority(task,date)) onInfo(tr("TOP 3 უკვე შევსებულია. ჯერ ერთს მოხსენი ვარსკვლავი.","TOP 3 is full. Unstar a task first."))}.padding(9.dp),color=Amber,fontSize=25.sp)
        Text("✎",Modifier.clickable {onEdit(task)}.padding(7.dp),fontSize=16.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CalendarScreen(store:PlannerStore,date:LocalDate,onDate:(LocalDate)->Unit,view:String,onView:(String)->Unit,onAdd:()->Unit,onEdit:(PlanTask)->Unit,onInfo:(String)->Unit) {
    val lang=store.english
    val selectedTasks=store.tasks.filter {occurrence(it,date)}.sortedBy {it.time}
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(14.dp)) {
        Heading(tr("კალენდარი","Calendar"),tr("ნახე დღე, კვირა და თვე","See your plans at a glance"), "＋") {onAdd()}
        SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
            listOf("day","week","month","year").forEachIndexed { index,v ->
                SegmentedButton(selected=view==v,onClick={onView(v)},shape=SegmentedButtonDefaults.itemShape(index,4)) {
                    Text(when(v){"day"->tr("დღე","Day");"week"->tr("კვირა","Week");"month"->tr("თვე","Month");else->tr("წელი","Year")},fontSize=11.sp)
                }
            }
        }
        DateStrip(date,onDate,lang,view)
        if(view=="year") {
            YearCalendar(store,date,onDate,onView)
        }
        if(view=="week") {
            val start=date.minusDays((date.dayOfWeek.value-1).toLong())
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(3.dp)) {
                (0..6).forEach { i ->
                    val d=start.plusDays(i.toLong())
                    Surface(shape=RoundedCornerShape(12.dp), color=if(d==date)Pine else MaterialTheme.colorScheme.surface,modifier=Modifier.weight(1f).clickable{onDate(d)}) {
                        Column(Modifier.padding(vertical=12.dp),horizontalAlignment=Alignment.CenterHorizontally) {
                            Text(d.dayOfWeek.getDisplayName(TextStyle.SHORT,DiaryWords.locale()).take(2),fontSize=10.sp,color=if(d==date)Color.White else MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("${d.dayOfMonth}",fontSize=14.sp,fontWeight=FontWeight.Bold,color=if(d==date)Color.White else MaterialTheme.colorScheme.onSurface)
                            if(store.tasks.any {occurrence(it,d)}) Text("•",color=if(d==date)Color.White else Pine)
                        }
                    }
                }
            }
        } else if(view=="month") {
            val start=date.withDayOfMonth(1)
            val first=start.minusDays((start.dayOfWeek.value-1).toLong())
            Panel {
                Row { (1..7).forEach { n->Text(DayOfWeek.of(n).getDisplayName(TextStyle.SHORT,DiaryWords.locale()).take(2),Modifier.weight(1f),textAlign=TextAlign.Center,fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant) } }
                (0..5).forEach { week ->
                    Row(Modifier.fillMaxWidth()) {
                        (0..6).forEach { dayIndex ->
                            val d=first.plusDays((week*7+dayIndex).toLong())
                            Column(Modifier.weight(1f).clickable {onDate(d)}.padding(vertical=8.dp),horizontalAlignment=Alignment.CenterHorizontally) {
                                Surface(color=if(d==date) Pine else Color.Transparent,shape=CircleShape) {
                                    Text("${d.dayOfMonth}",Modifier.padding(horizontal=8.dp,vertical=5.dp),fontSize=12.sp,color=if(d==date)Color.White else if(d.monthValue!=date.monthValue)Color.Gray else MaterialTheme.colorScheme.onSurface)
                                }
                                if(store.tasks.any {occurrence(it,d)}) Text("•",color=Pine,fontSize=12.sp)
                            }
                        }
                    }
                }
            }
        }
        Panel {
            Row(verticalAlignment=Alignment.CenterVertically) {
                Text(tr("არჩეული დღის საქმეები","Tasks for selected day"),fontWeight=FontWeight.Bold,modifier=Modifier.weight(1f))
                Tag("${selectedTasks.size}",true)
            }
            if(selectedTasks.isEmpty()) Text(tr("საქმეები არ არის","No tasks"),color=MaterialTheme.colorScheme.onSurfaceVariant)
            selectedTasks.forEach {TaskRow(it,date,store,onEdit,onInfo)}
        }
        Spacer(Modifier.height(20.dp))
    }
}


@Composable
private fun YearCalendar(store:PlannerStore,date:LocalDate,onDate:(LocalDate)->Unit,onView:(String)->Unit) {
    Panel {
        Text(tr("წლის კალენდარი","Year calendar"),fontWeight=FontWeight.Bold,fontSize=16.sp)
        (0..3).forEach { row ->
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                (1..3).forEach { column ->
                    val month=row*3+column
                    val first=LocalDate.of(date.year,month,1)
                    val days=(1..first.lengthOfMonth()).map { first.withDayOfMonth(it) }
                    val count=store.tasks.count { task -> days.any { occurrence(task,it) } }
                    val selected=date.monthValue==month
                    Surface(shape=RoundedCornerShape(17.dp),border=BorderStroke(1.dp,if(selected) Pine else MaterialTheme.colorScheme.outlineVariant),
                        color=if(selected) Mint else MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.50f),
                        modifier=Modifier.weight(1f).clickable { onDate(first); onView("month") }) {
                        Column(Modifier.padding(vertical=13.dp,horizontal=5.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(3.dp)) {
                            Text(first.month.getDisplayName(TextStyle.SHORT,DiaryWords.locale()),fontSize=12.sp,fontWeight=FontWeight.Bold,color=if(selected) DarkPine else MaterialTheme.colorScheme.onSurface,maxLines=1)
                            Text(if(count>0) "$count ${tr("საქმე","tasks")}" else "—",fontSize=10.sp,color=if(selected) Pine else MaterialTheme.colorScheme.onSurfaceVariant,maxLines=1)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun GoalsScreen(store:PlannerStore,onAdd:()->Unit,onEditTask:(PlanTask)->Unit) {
    val lang=store.english
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(14.dp)) {
        Heading(tr("ჩემი მიზნები","My goals"),tr("დიდი მიზნები პატარა ნაბიჯებით","Big things, small steps"), "＋") {onAdd()}
        if(store.goals.isEmpty()) Panel {
            Text(tr("შექმენი მიზანი და დაუკავშირე დავალებები, რომ პროგრესი დაინახო.","Set a goal and link tasks to it to track your progress."))
        }
        store.goals.forEach { goal ->
            val progress=store.tasks.filter {it.goalId==goal.id}.sumOf {it.completed.size}
            Panel {
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Text("◎",fontSize=25.sp,color=Pine)
                    Spacer(Modifier.width(8.dp))
                    Column(Modifier.weight(1f)) {
                        Text(goal.title,fontWeight=FontWeight.Bold)
                        Text(tr(goal.category,categoryEn(goal.category)),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text("${progress.coerceAtMost(goal.target)}/${goal.target}",fontWeight=FontWeight.Bold,color=Pine)
                }
                LinearProgressIndicator(progress={progress.toFloat().div(goal.target.coerceAtLeast(1)).coerceIn(0f,1f)},modifier=Modifier.fillMaxWidth().height(8.dp),color=Pine,trackColor=Mint)
                Text("${((progress.toFloat()/goal.target.coerceAtLeast(1))*100).coerceAtMost(100f).toInt()}%",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                var confirm by remember {mutableStateOf(false)}
                TextButton(onClick={confirm=true}){Text(tr("მიზნის წაშლა","Delete goal"))}
                if(confirm) AlertDialog(onDismissRequest={confirm=false},title={Text(tr("წავშალოთ მიზანი?","Delete goal?"))},text={Text(tr("დაკავშირებული დავალებები შენარჩუნდება.","Linked tasks will remain."))},confirmButton={TextButton(onClick={store.deleteGoal(goal.id);confirm=false}){Text(tr("წაშლა","Delete"))}},dismissButton={TextButton(onClick={confirm=false}){Text(tr("გაუქმება","Cancel"))}})
            }
        }
        Spacer(Modifier.height(20.dp))
    }
}

@Composable
private fun InsightsScreen(store:PlannerStore) {
    val lang=store.english
    val end=LocalDate.now(); val start=end.minusDays(6)
    val days=(0..6).map {start.plusDays(it.toLong())}
    val total=days.sumOf {date->store.tasks.count {occurrence(it,date)}}
    val done=days.sumOf {date->store.tasks.count {occurrence(it,date)&&taskComplete(it,date)}}
    val ratio=if(total==0)0 else (100*done/total)
    val monthStart=end.withDayOfMonth(1)
    val monthDays=(0 until end.dayOfMonth).map { monthStart.plusDays(it.toLong()) }
    val monthTotal=monthDays.sumOf { d->store.tasks.count {occurrence(it,d)} }
    val monthDone=monthDays.sumOf { d->store.tasks.count {occurrence(it,d)&&taskComplete(it,d)} }
    val streakAnchor=if(store.tasks.any{occurrence(it,end)&&taskComplete(it,end)})end else end.minusDays(1)
    val streak=(0..365).takeWhile { n->val day=streakAnchor.minusDays(n.toLong());store.tasks.any { occurrence(it,day)&&taskComplete(it,day) } }.count()
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(14.dp)) {
        Heading(tr("ჩემი შედეგები","My results"),tr("ბოლო 7 დღე","Last 7 days"))
        Row(horizontalArrangement=Arrangement.spacedBy(10.dp)) {
            listOf((tr("შესრულებულია","Completed")) to "$done", (tr("შესრულება","Completion")) to "$ratio%").forEach { (label,value)->
                Surface(shape=MaterialShape,color=MaterialTheme.colorScheme.surface,modifier=Modifier.weight(1f)) {
                    Column(Modifier.padding(15.dp)) { Text(value,fontSize=29.sp,color=Pine,fontWeight=FontWeight.Bold);Text(label,fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant) }
                }
            }
        }
        Row(horizontalArrangement=Arrangement.spacedBy(10.dp)) {
            listOf(tr("ამ თვეში","This month") to "$monthDone/$monthTotal",tr("აქტიური დღეები","Day streak") to "$streak").forEach { (label,value)->
                Surface(shape=MaterialShape,color=MaterialTheme.colorScheme.surface,modifier=Modifier.weight(1f)) {
                    Column(Modifier.padding(15.dp),verticalArrangement=Arrangement.spacedBy(4.dp)) {
                        Text(value,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary,fontSize=21.sp)
                        Text(label,fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
        Panel {
            Text(tr("დღიური აქტივობა","Daily progress"),fontWeight=FontWeight.Bold)
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(10.dp),verticalAlignment=Alignment.Bottom) {
                days.forEach { day ->
                    val all=store.tasks.count {occurrence(it,day)}
                    val finished=store.tasks.count {occurrence(it,day)&&taskComplete(it,day)}
                    val fraction=if(all==0)0f else finished.toFloat()/all
                    Column(Modifier.weight(1f),horizontalAlignment=Alignment.CenterHorizontally) {
                        Box(Modifier.fillMaxWidth().height(125.dp).background(MaterialTheme.colorScheme.surfaceVariant,RoundedCornerShape(8.dp)),contentAlignment=Alignment.BottomCenter) {
                            Box(Modifier.fillMaxWidth().fillMaxHeight(fraction).background(Pine,RoundedCornerShape(8.dp)))
                        }
                        Spacer(Modifier.height(6.dp))
                        Text(day.dayOfWeek.getDisplayName(TextStyle.SHORT,DiaryWords.locale()).take(2),fontSize=10.sp)
                        Text("$finished/$all",fontSize=9.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
        Panel {
            Text(tr("კვირის შეჯამება","Your week"),fontWeight=FontWeight.Bold)
            Text(if(total==0) (tr("დაამატე დავალებები და შედეგებიც აქ გამოჩნდება.","Add tasks to start seeing results.")) else (DiaryWords.weekSummary(done,total)),fontSize=13.sp)
        }
    }
}

@Composable
private fun SettingsScreen(store:PlannerStore,requestPermission:()->Unit,onInfo:(String)->Unit) {
    val lang=store.english
    val context=androidx.compose.ui.platform.LocalContext.current
    var pendingBackup by remember { mutableStateOf<String?>(null) }
    val exportLauncher=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if(uri!=null) {
            val result=runCatching { context.contentResolver.openOutputStream(uri)?.bufferedWriter(Charsets.UTF_8)?.use { it.write(store.exportBackup()) } ?: error("Cannot open file") }
            onInfo(if(result.isSuccess)tr("სარეზერვო ასლი შენახულია","Backup saved") else tr("ასლის შენახვა ვერ მოხერხდა","Backup could not be saved"))
        }
    }
    val importLauncher=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if(uri!=null) {
            val result=runCatching { context.contentResolver.openInputStream(uri)?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: error("Cannot read file") }
            if(result.isSuccess) pendingBackup=result.getOrNull() else onInfo(tr("ფაილის წაკითხვა ვერ მოხერხდა","Cannot read backup file"))
        }
    }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(14.dp)) {
        Heading(tr("პარამეტრები","Settings"),tr("დღიური შენს გემოზე","Make Diary yours"))
        Panel {
            SettingToggle(tr("მუქი რეჟიმი","Dark mode"),store.dark,store::changeDark)
            HorizontalDivider()
            DiaryLanguageDropdown(store)
        }
        Panel {
            Text(tr("შეხსენების ნაგულისხმევი რეჟიმი","Reminder defaults"),fontWeight=FontWeight.Bold)
            listOf(-1 to (tr("ხელით ჩართვა","Off until enabled")),0 to (tr("საქმის დაწყებისას","At task time")),5 to (tr("5 წუთით ადრე","5 minutes early")),15 to (tr("15 წუთით ადრე","15 minutes early")),30 to (tr("30 წუთით ადრე","30 minutes early")),1440 to (tr("1 დღით ადრე","1 day before"))).forEach { (v,label) ->
                Row(Modifier.fillMaxWidth().clickable {store.changeReminderDefault(v)},verticalAlignment=Alignment.CenterVertically) {
                    RadioButton(selected=store.reminderDefault==v,onClick={store.changeReminderDefault(v)})
                    Text(label,fontSize=13.sp)
                }
            }
            Text(tr("არსებულ დავალებებს საკუთარი შეხსენების დრო უნარჩუნდება.","Existing tasks keep their own reminders."),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
            FilledTonalButton(onClick=requestPermission) {Text(tr("ტელეფონის შეტყობინებების ჩართვა","Enable phone notifications"))}
            Text(tr("Android-ის ენერგოდაზოგვის გამო შეტყობინება შეიძლება დაგვიანდეს; ზუსტი მაღვიძარის ნებართვას აპი არ ითხოვს.","Reminders can arrive later due to Android battery rules; exact alarms are not requested."),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Panel {
            SettingToggle(tr("ჩუმი საათები","Quiet hours"),store.quietEnabled,store::changeQuietEnabled)
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalAlignment=Alignment.CenterVertically) {
                OutlinedButton(onClick={pickTime(context,store.quietStart){store.setQuiet(it,store.quietEnd)}}) {Text(store.quietStart)}
                Text("—")
                OutlinedButton(onClick={pickTime(context,store.quietEnd){store.setQuiet(store.quietStart,it)}}) {Text(store.quietEnd)}
            }
            Text(tr("ჩუმ საათებში შეხსენება აღარ გაიგზავნება და მოგვიანებით არ გადაინაცვლებს.","Quiet hours suppress, not postpone, reminders."),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Panel {
            Text(tr("მონაცემები და კონფიდენციალურობა","Data & privacy"),fontWeight=FontWeight.Bold)
            Text(tr("ყველაფერი ტელეფონში ინახება. არ არის ანგარიში, რეკლამები და მომხმარებლის თვალთვალი.","Everything is saved locally on your phone. No account, ads or analytics tracking."),fontSize=13.sp)
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick={exportLauncher.launch("DGIURI_backup_${LocalDate.now()}.json")},modifier=Modifier.weight(1f)) { Text(tr("ასლის შენახვა","Export backup"),fontSize=12.sp) }
                OutlinedButton(onClick={importLauncher.launch(arrayOf("application/json","text/plain","application/octet-stream"))},modifier=Modifier.weight(1f)) { Text(tr("ასლის აღდგენა","Import backup"),fontSize=12.sp) }
            }
            Text(tr("ასლის აღდგენა ჩაანაცვლებს ამჟამინდელ საქმეებს; წინასწარ შეინახე სარეზერვო ასლი.","Import replaces your current tasks. Export a backup first."),fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Spacer(Modifier.height(12.dp))
    }
    if(pendingBackup!=null) AlertDialog(onDismissRequest={pendingBackup=null},
        title={Text(tr("აღვადგინოთ სარეზერვო ასლი?","Restore backup?"))},
        text={Text(tr("მიმდინარე ჩანაწერები ჩანაცვლდება. გაგრძელებამდე შეინახე მათი ასლი.","Current entries will be replaced. Back them up first."))},
        confirmButton={Button(onClick={
            val imported=store.importBackup(pendingBackup.orEmpty())
            pendingBackup=null
            onInfo(if(imported)tr("მონაცემები აღდგენილია","Backup restored") else tr("არასწორი ასლის ფაილია","Invalid backup file"))
        }){Text(tr("აღდგენა","Restore"))}},
        dismissButton={TextButton(onClick={pendingBackup=null}){Text(tr("გაუქმება","Cancel"))}})
}

@Composable
private fun DiaryLanguageDropdown(store: PlannerStore) {
    var open by remember { mutableStateOf(false) }
    Row(Modifier.fillMaxWidth(), verticalAlignment=Alignment.CenterVertically) {
        Text(tr("ენა", "Language"), Modifier.weight(1f), fontSize=14.sp)
        Box {
            OutlinedButton(onClick={open=true}, contentPadding=PaddingValues(horizontal=12.dp,vertical=4.dp)) {
                Text(DiaryWords.languageLabel(store.language), fontSize=12.sp, maxLines=1)
                Text(" ▾", fontSize=11.sp)
            }
            DropdownMenu(expanded=open,onDismissRequest={open=false}) {
                DiaryWords.languages.forEach { (code,label) ->
                    DropdownMenuItem(text={Text((if(code==store.language) "✓  " else "     ")+label)},
                        onClick={ store.changeLanguage(code); open=false })
                }
            }
        }
    }
}

@Composable private fun SettingToggle(label:String,value:Boolean,onChange:(Boolean)->Unit) {
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
        Text(label,Modifier.weight(1f),fontSize=14.sp)
        Switch(checked=value,onCheckedChange=onChange)
    }
}
private fun pickTime(context:android.content.Context, initial:String, onSet:(String)->Unit):()->Unit = {
    val parts=initial.split(":").mapNotNull{it.toIntOrNull()}
    TimePickerDialog(context,{_,h,m->onSet("%02d:%02d".format(Locale.US,h,m))},parts.getOrElse(0){9},parts.getOrElse(1){0},true).show()
}
private fun categoryEn(value:String):String = when(value) {"სამუშაო"->"Work";"პირადი"->"Personal";"ჯანმრთელობა"->"Health";"სწავლა"->"Study";"საყიდლები"->"Shopping";else->"Other"}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun InlineClock(value:String,onChange:(String)->Unit,onDone:()->Unit,english:Boolean) {
    val hour=value.substringBefore(":").toIntOrNull()?.coerceIn(0,23) ?: 9
    val minute=value.substringAfter(":","00").toIntOrNull()?.coerceIn(0,59) ?: 0
    fun set(h:Int,m:Int) { onChange("%02d:%02d".format(Locale.US,h,m)) }
    Surface(shape=RoundedCornerShape(16.dp),color=MaterialTheme.colorScheme.surfaceVariant,modifier=Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp),verticalArrangement=Arrangement.spacedBy(7.dp)) {
            Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
                Text(tr("აირჩიე საათი","Pick an hour"),Modifier.weight(1f),fontWeight=FontWeight.Bold,fontSize=13.sp)
                TextButton(onClick=onDone) { Text(tr("მზადაა","Done")) }
            }
            (0..3).forEach { r->
                Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(3.dp)) {
                    (0..5).forEach { c->val h=r*6+c
                        OutlinedButton(onClick={set(h,minute)},modifier=Modifier.weight(1f).height(36.dp),contentPadding=PaddingValues(0.dp),colors=ButtonDefaults.outlinedButtonColors(containerColor=if(hour==h) Pine else MaterialTheme.colorScheme.surface,contentColor=if(hour==h)Color.White else MaterialTheme.colorScheme.onSurface)) {Text("%02d".format(Locale.US,h),fontSize=11.sp)}
                    }
                }
            }
            Text(tr("წუთები","Minutes"),fontSize=12.sp,fontWeight=FontWeight.SemiBold)
            (0..1).forEach { r->
                Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(3.dp)) {
                    (0..5).forEach { c->val m=(r*6+c)*5
                        OutlinedButton(onClick={set(hour,m)},modifier=Modifier.weight(1f).height(36.dp),contentPadding=PaddingValues(0.dp),colors=ButtonDefaults.outlinedButtonColors(containerColor=if(minute==m) Pine else MaterialTheme.colorScheme.surface,contentColor=if(minute==m)Color.White else MaterialTheme.colorScheme.onSurface)) {Text("%02d".format(Locale.US,m),fontSize=11.sp)}
                    }
                }
            }
            Row(verticalAlignment=Alignment.CenterVertically) {
                Text(tr("ზუსტი წუთი:","Exact minute:"),fontSize=11.sp)
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(value="%02d".format(Locale.US,minute),onValueChange={raw->raw.toIntOrNull()?.takeIf{it in 0..59}?.let{set(hour,it)}},singleLine=true,keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number),modifier=Modifier.width(80.dp))
                Spacer(Modifier.weight(1f))
                Text("%02d:%02d".format(Locale.US,hour,minute),fontWeight=FontWeight.Bold,color=Pine)
            }
        }
    }
}

@Composable
private fun TaskDialog(store:PlannerStore, old:PlanTask?, day:LocalDate, onClose:()->Unit,onInfo:(String)->Unit) {
    val context=androidx.compose.ui.platform.LocalContext.current
    val lang=store.english
    val focusManager=LocalFocusManager.current
    val keyboard=LocalSoftwareKeyboardController.current
    var title by remember(old) { mutableStateOf(old?.title ?: "") }
    var date by remember(old) { mutableStateOf(runCatching{LocalDate.parse(old?.date ?: day.toString())}.getOrDefault(day)) }
    var time by remember(old) { mutableStateOf(old?.time ?: "") }
    var showClock by remember(old) { mutableStateOf(false) }
    var duration by remember(old) { mutableIntStateOf(old?.durationMinutes ?: 0) }
    var category by remember(old) { mutableStateOf(old?.category ?: "პირადი") }
    var details by remember(old) { mutableStateOf(old?.details ?: "") }
    var repeat by remember(old) { mutableStateOf(old?.repeat ?: "none") }
    var reminder by remember(old) { mutableIntStateOf(old?.reminder ?: store.reminderDefault) }
    var goalId by remember(old) { mutableStateOf(old?.goalId ?: "") }
    var catMenu by remember {mutableStateOf(false)}
    var repeatMenu by remember {mutableStateOf(false)}
    var reminderMenu by remember {mutableStateOf(false)}
    var goalMenu by remember {mutableStateOf(false)}
    var deleteConfirm by remember {mutableStateOf(false)}
    var error by remember {mutableStateOf("")}
    AlertDialog(
        onDismissRequest=onClose,
        title={Text(if(old==null)(tr("ახალი საქმე","New task")) else (tr("საქმის რედაქტირება","Edit task")))},
        text={Column(Modifier.fillMaxWidth().heightIn(max=530.dp).verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(title,{title=it;error=""},label={Text(tr("სათაური","Title"))},singleLine=true,modifier=Modifier.fillMaxWidth())
            if(error.isNotBlank()) Text(error,color=MaterialTheme.colorScheme.error,fontSize=12.sp)
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick={focusManager.clearFocus();keyboard?.hide();DatePickerDialog(context,{_,y,m,d->date=LocalDate.of(y,m+1,d)},date.year,date.monthValue-1,date.dayOfMonth).show()}){Text("▦ ${date}",fontSize=12.sp)}
                OutlinedButton(onClick={focusManager.clearFocus();keyboard?.hide();showClock=!showClock}){Text("◷ ${time.ifBlank{tr("აირჩიე საათი","Choose time")}}",fontSize=12.sp)}
                if(time.isNotEmpty()) TextButton(onClick={time=""}){Text("✕")}
            }
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)) {
                listOf(tr("დღეს","Today") to LocalDate.now(),tr("ხვალ","Tomorrow") to LocalDate.now().plusDays(1),tr("+7 დღე","+7 days") to date.plusDays(7)).forEach { (label,d) ->
                    FilterChip(selected=date==d,onClick={date=d},label={Text(label,fontSize=11.sp)})
                }
            }
            if(showClock) InlineClock(time.ifBlank { "09:00" },{time=it},{showClock=false},lang)
            Text(tr("ხანგრძლივობა (არასავალდებულო)","Duration (optional)"),fontSize=12.sp,fontWeight=FontWeight.SemiBold)
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)) {
                listOf(0,15,30,60,90,120).forEach { minutes ->
                    FilterChip(selected=duration==minutes,onClick={duration=minutes},label={Text(DiaryWords.duration(minutes),fontSize=11.sp)})
                }
            }
            Row(horizontalArrangement=Arrangement.spacedBy(7.dp)) {
                Box { OutlinedButton(onClick={catMenu=true}){Text(tr(category,categoryEn(category)),fontSize=11.sp)}
                    DropdownMenu(expanded=catMenu,onDismissRequest={catMenu=false}) { TASK_CATEGORIES.forEach { c->DropdownMenuItem(text={Text(tr(c,categoryEn(c)))},onClick={category=c;catMenu=false}) } }
                }
                Box { OutlinedButton(onClick={repeatMenu=true}){Text(when(repeat){"daily"->tr("დღიურად","Daily");"weekly"->tr("კვირაში","Weekly");"monthly"->tr("თვეში","Monthly");else->tr("ერთჯერადი","Once")},fontSize=11.sp)}
                    DropdownMenu(expanded=repeatMenu,onDismissRequest={repeatMenu=false}) {listOf("none","daily","weekly","monthly").forEach { v ->DropdownMenuItem(text={Text(when(v){"daily"->tr("ყოველდღე","Daily");"weekly"->tr("ყოველკვირა","Weekly");"monthly"->tr("ყოველთვე","Monthly");else->tr("ერთჯერადი","Once")})},onClick={repeat=v;repeatMenu=false})} }
                }
            }
            Row(horizontalArrangement=Arrangement.spacedBy(7.dp)) {
                Box {OutlinedButton(onClick={reminderMenu=true}){Text(if(reminder<0)(tr("შეხსენების გარეშე","No reminder")) else (DiaryWords.reminderAhead(reminder)),fontSize=11.sp)}
                    DropdownMenu(expanded=reminderMenu,onDismissRequest={reminderMenu=false}) { listOf(-1,0,5,15,30,1440).forEach { m ->DropdownMenuItem(text={Text(when(m){-1->tr("გამორთული","Off");0->tr("დაწყებისას","At start");1440->tr("1 დღით ადრე","1 day before");else->DiaryWords.minutesBefore(m)})},onClick={reminder=m;reminderMenu=false})} }
                }
            }
            if(store.goals.isNotEmpty()) {
                Box {OutlinedButton(onClick={goalMenu=true}){Text((if(goalId.isEmpty())(tr("მიზნის გარეშე","No linked goal")) else store.goals.firstOrNull{it.id==goalId}?.title ?: "—"),fontSize=11.sp)}
                    DropdownMenu(expanded=goalMenu,onDismissRequest={goalMenu=false}) {
                        DropdownMenuItem(text={Text(tr("მიზნის გარეშე","No goal"))},onClick={goalId="";goalMenu=false})
                        store.goals.forEach {g->DropdownMenuItem(text={Text(g.title)},onClick={goalId=g.id;goalMenu=false})}
                    }
                }
            }
            OutlinedTextField(details,{details=it},label={Text(tr("შენიშვნა (არასავალდებულო)","Notes (optional)"))},minLines=2,modifier=Modifier.fillMaxWidth())
            if(old!=null) Row(verticalAlignment=Alignment.CenterVertically) {
                TextButton(onClick={
                    store.addTask(old.copy(id=java.util.UUID.randomUUID().toString(),completed=emptySet(),priorities=emptyMap()))
                    onInfo(tr("საქმე დაკოპირებულია","Task duplicated"))
                    onClose()
                }) {Text(tr("დუბლირება","Duplicate"))}
                TextButton(onClick={deleteConfirm=true}) {Text(tr("საქმის წაშლა","Delete task"),color=MaterialTheme.colorScheme.error)}
            }
        }},
        confirmButton={Button(onClick={
            if(title.isBlank()) {error=tr("შეიყვანე სათაური","Enter a title")}
            else if(reminder>=0 && time.isEmpty()) {error=tr("შეხსენებისთვის საათიც აირჩიე","Choose a time for this reminder")}
            else {
                val updated=(old ?: PlanTask(title=title.trim(),date=date.toString())).copy(title=title.trim(),date=date.toString(),time=time,category=category,repeat=repeat,reminder=reminder,details=details,goalId=goalId,durationMinutes=duration)
                if(old==null)store.addTask(updated) else store.updateTask(updated)
                onInfo(tr("საქმე შენახულია","Task saved"));onClose()
            }
        }){Text(tr("შენახვა","Save"))}},
        dismissButton={TextButton(onClick=onClose){Text(tr("გაუქმება","Cancel"))}}
    )
    if(deleteConfirm && old!=null) AlertDialog(onDismissRequest={deleteConfirm=false},title={Text(tr("წავშალოთ საქმე?","Delete task?"))},confirmButton={Button(onClick={store.deleteTask(old.id);deleteConfirm=false;onClose()}){Text(tr("წაშლა","Delete"))}},dismissButton={TextButton(onClick={deleteConfirm=false}){Text(tr("გაუქმება","Cancel"))}})
}
@Composable
private fun GoalDialog(store:PlannerStore,onClose:()->Unit) {
    val lang=store.english
    var name by remember {mutableStateOf("")}
    var target by remember {mutableStateOf("10")}
    var category by remember {mutableStateOf("პირადი")}
    var menu by remember {mutableStateOf(false)}
    AlertDialog(onDismissRequest=onClose,title={Text(tr("ახალი მიზანი","New goal"))},text={Column(verticalArrangement=Arrangement.spacedBy(9.dp)) {
        OutlinedTextField(name,{name=it},label={Text(tr("მიზნის სახელი","Goal title"))},singleLine=true)
        OutlinedTextField(target,{target=it.filter{c->c.isDigit()}},label={Text(tr("სამიზნე რაოდენობა","Target count"))},keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number),singleLine=true)
        Box { OutlinedButton(onClick={menu=true}){Text(tr(category,categoryEn(category)))}
            DropdownMenu(menu,{menu=false}){TASK_CATEGORIES.forEach{c->DropdownMenuItem(text={Text(tr(c,categoryEn(c)))},onClick={category=c;menu=false})}}
        }
        Text(tr("მიზანს ახალი ან არსებული დავალებები დაუკავშირე.","Link tasks to this goal when creating or editing a task."),fontSize=12.sp)
    }},confirmButton={Button(enabled=name.isNotBlank()&&(target.toIntOrNull() ?: 0)>0,onClick={store.addGoal(PlanGoal(title=name.trim(),target=target.toInt(),category=category));onClose()}){Text(tr("შექმნა","Create"))}},dismissButton={TextButton(onClick=onClose){Text(tr("გაუქმება","Cancel"))}})
}

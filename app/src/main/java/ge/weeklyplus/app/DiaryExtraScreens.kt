package ge.weeklyplus.app

import android.app.TimePickerDialog
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable private fun ExtraCard(content:@Composable ColumnScope.()->Unit) {
    Surface(Modifier.fillMaxWidth(),shape=RoundedCornerShape(20.dp),color=MaterialTheme.colorScheme.surface,
        border=BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant.copy(alpha=.5f))) {
        Column(Modifier.padding(15.dp),verticalArrangement=Arrangement.spacedBy(12.dp),content=content)
    }
}
@Composable private fun ExtraHeading(title:String,subtitle:String) {
    Column {Text(title,fontWeight=FontWeight.Bold,fontSize=23.sp)
        Text(subtitle,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}
}

@Composable fun DiaryTimerPage(requestPermission:()->Unit) {
    val context=LocalContext.current
    var hours by remember {mutableStateOf("0")}
    var minutes by remember {mutableStateOf("5")}
    var seconds by remember {mutableStateOf("0")}
    var until by remember {mutableLongStateOf(DiaryClockScheduler.timerUntil(context))}
    var now by remember {mutableLongStateOf(System.currentTimeMillis())}
    var error by remember {mutableStateOf("")}
    LaunchedEffect(until) {
        while(until>0) {
            now=System.currentTimeMillis()
            if(now>=until||DiaryClockScheduler.timerUntil(context)==0L){until=0;break}
            delay(500)
        }
    }
    val s=((until-now+999)/1000).coerceAtLeast(0)
    val shown="%02d:%02d:%02d".format(Locale.US,s/3600,s/60%60,s%60)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(15.dp)) {
        ExtraHeading("ტაიმერი / Timer","დროის უკუთვლა • ხმოვანი შეხსენება")
        DiaryExactAlarmPermission()
        ExtraCard {
            Text(if(until>0)shown else "%02d:%02d:%02d".format(Locale.US,
                hours.toIntOrNull()?:0,minutes.toIntOrNull()?:0,seconds.toIntOrNull()?:0),
                Modifier.fillMaxWidth(),textAlign=TextAlign.Center,fontSize=39.sp,
                color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
            if(until==0L) {
                Row(horizontalArrangement=Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(hours,{hours=it.filter{c->c.isDigit()}.take(3)},label={Text("საათი")},
                        singleLine=true,modifier=Modifier.weight(1f),keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number))
                    OutlinedTextField(minutes,{minutes=it.filter{c->c.isDigit()}.take(3)},label={Text("წუთი")},
                        singleLine=true,modifier=Modifier.weight(1f),keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number))
                    OutlinedTextField(seconds,{seconds=it.filter{c->c.isDigit()}.take(3)},label={Text("წამი")},
                        singleLine=true,modifier=Modifier.weight(1f),keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number))
                }
                if(error.isNotBlank())Text(error,color=MaterialTheme.colorScheme.error,fontSize=12.sp)
                Button(onClick={
                    val value=(hours.toLongOrNull()?:0)*3600+(minutes.toLongOrNull()?:0)*60+(seconds.toLongOrNull()?:0)
                    if(value !in 1..604800L)error="შეიყვანე დრო 1 წამიდან 7 დღემდე"
                    else {DiaryClockScheduler.channel(context);DiaryClockScheduler.startTimer(context,value)
                        until=DiaryClockScheduler.timerUntil(context);now=System.currentTimeMillis()
                        error="";requestPermission()}
                },modifier=Modifier.fillMaxWidth()){Text("დაწყება / Start")}
            } else {
                Button(onClick={DiaryClockScheduler.cancelTimer(context);until=0},modifier=Modifier.fillMaxWidth()) {
                    Text("გაუქმება / Cancel")
                }
            }
            Text("უკუთვლა მუშაობს მაშინაც, როცა აპი დახურულია. ხმოვანი სიგნალისთვის ჩართე შეტყობინებები და ტელეფონის ხმა.",
                fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable fun DiaryAlarmPage(requestPermission:()->Unit) {
    val context=LocalContext.current
    var hour by remember {mutableIntStateOf(DiaryClockScheduler.alarmHour(context))}
    var minute by remember {mutableIntStateOf(DiaryClockScheduler.alarmMinute(context))}
    var label by remember {mutableStateOf(DiaryClockScheduler.alarmLabel(context))}
    var enabled by remember {mutableStateOf(DiaryClockScheduler.alarmEnabled(context))}
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(15.dp)) {
        ExtraHeading("მაღვიძარა / Alarm","ყოველდღიური მაღვიძარა • დრო და სახელი")
        DiaryExactAlarmPermission()
        ExtraCard {
            Text("%02d:%02d".format(Locale.US,hour,minute),Modifier.fillMaxWidth(),textAlign=TextAlign.Center,
                fontSize=42.sp,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
            OutlinedButton(onClick={
                TimePickerDialog(context,{_,h,m->hour=h;minute=m},hour,minute,true).show()
            },modifier=Modifier.fillMaxWidth()){Text("საათის არჩევა")}
            OutlinedTextField(label,{label=it.take(80)},modifier=Modifier.fillMaxWidth(),
                label={Text("მაღვიძარის სახელი")},singleLine=true)
            if(enabled){
                Text("● მაღვიძარა ჩართულია",color=MaterialTheme.colorScheme.primary)
                val next=DiaryClockScheduler.nextAlarmAt(context)
                if(next>0)Text("შემდეგი: "+Instant.ofEpochMilli(next).atZone(ZoneId.systemDefault())
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),fontSize=12.sp)
                Button(onClick={DiaryClockScheduler.cancelDailyAlarm(context);enabled=false},modifier=Modifier.fillMaxWidth()){
                    Text("გამორთვა")}
            } else {
                Button(onClick={DiaryClockScheduler.setDailyAlarm(context,hour,minute,label);enabled=true;requestPermission()},
                    modifier=Modifier.fillMaxWidth()){Text("მაღვიძარის ჩართვა")}
            }
            Text("ყოველდღიურად დარეკავს არჩეულ საათზე. აპის შეტყობინებებზე ნებართვა აუცილებელია.",
                fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable fun DiaryThemeDropdown(store:PlannerStore) {
    var open by remember{mutableStateOf(false)}
    val options=listOf(false to "☀ ღია",true to "☾ შავი / მუქი")
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically) {
        Text("ეკრანის ფონი / Theme",Modifier.weight(1f),fontSize=14.sp)
        Box {
            OutlinedButton(onClick={open=true},contentPadding=PaddingValues(horizontal=12.dp,vertical=5.dp)){
                Text(options.first{it.first==store.dark}.second,fontSize=12.sp);Text(" ▾")
            }
            DropdownMenu(open,onDismissRequest={open=false},containerColor=MaterialTheme.colorScheme.surface) {
                options.forEach{(dark,name)->
                    DropdownMenuItem(text={Text((if(dark==store.dark)"✓  " else "")+name,
                        color=MaterialTheme.colorScheme.onSurface)},onClick={store.changeDark(dark);open=false})
                }
            }
        }
    }
}

@Composable private fun DiaryLink(icon:String,title:String,details:String,url:String,shade:Color) {
    val uri=LocalUriHandler.current
    Row(Modifier.fillMaxWidth().clickable{runCatching{uri.openUri(url)}}.padding(vertical=6.dp),
        verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(11.dp)) {
        Box(Modifier.size(44.dp).background(shade,RoundedCornerShape(11.dp)),contentAlignment=Alignment.Center){
            Text(icon,color=Color.White,fontSize=18.sp,fontWeight=FontWeight.ExtraBold)}
        Column(Modifier.weight(1f)) {Text(title,fontSize=13.sp,fontWeight=FontWeight.Bold)
            Text(details,fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}
        Text("↗",fontSize=18.sp,color=MaterialTheme.colorScheme.primary)
    }
}
@Composable fun DiaryCommunityLinks() {
    Column(verticalArrangement=Arrangement.spacedBy(5.dp)) {
        Text("ჩვენი საზოგადოება და თამაშები",fontWeight=FontWeight.Bold)
        DiaryLink("GGG","Georgian Gamers Guild","Facebook • ჩვენი სათამაშო საზოგადოება",
            "https://www.facebook.com/share/1FTD6S8ifN/",Color(0xFF1775AA))
        DiaryLink("ფ","PIRALI • ფირალი","Google Play • მხოლოდ დაშვებული ტესტერებისთვის",
            "https://play.google.com/apps/testing/ge.piraligame.pirali",Color(0xFF285D47))
        DiaryLink("GE","GEORGIA: Narikala Defense","Google Play • მხოლოდ დაშვებული ტესტერებისთვის",
            "https://play.google.com/apps/testing/com.piraligame.georgia",Color(0xFF9E4228))
        Text("ტესტირების ბმულები ყველასთვის ჯერ არ არის ხელმისაწვდომი. საჭიროების შემთხვევაში შეიცვლება საჯარო ბმულებით.",
            fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable fun DiaryJokerPage() {
    val context=LocalContext.current
    val model=remember{JokerHistory(context.applicationContext)}
    val r=model.rounds.size
    val cards=model.cardCount?:1
    var bids by remember(r){mutableStateOf(List(4){"0"})}
    var taken by remember(r){mutableStateOf(List(4){"0"})}
    var info by remember{mutableStateOf("")}
    var history by remember{mutableStateOf(true)}
    var selected by remember{mutableStateOf<JokerMatch?>(null)}
    val export=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")){u->
        if(u!=null)runCatching{context.contentResolver.openOutputStream(u)?.bufferedWriter()?.use{it.write(model.exportJson())}}
            .onSuccess{info="ისტორია შენახულია"}.onFailure{info=it.message?:"Export failed"}
    }
    val import=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){u->
        if(u!=null)runCatching{context.contentResolver.openInputStream(u)?.bufferedReader()?.use{model.importJson(it.readText())}?:0}
            .onSuccess{info="იმპორტირებულია: "+it}.onFailure{info="არასწორი ფაილია"}
    }
    val score=model.scores
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(12.dp)) {
        ExtraHeading("ჯოკერი / Joker","4 მოთამაშე • 24 დარიგება • ქულები და ისტორია")
        ExtraCard {
            Text("მიმდინარე პარტია • დარიგება "+(r+1)+"/24",fontWeight=FontWeight.Bold)
            Text("კარტების რაოდენობა: "+cards,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
            Row(horizontalArrangement=Arrangement.spacedBy(4.dp)){
                Text("მოთამაშე",Modifier.weight(1.5f),fontSize=10.sp)
                Text("თქვა",Modifier.weight(.65f),fontSize=10.sp)
                Text("აიღო",Modifier.weight(.65f),fontSize=10.sp)
                Text("ქულა",Modifier.weight(.65f),fontSize=10.sp)
            }
            for(i in 0..3){
                Row(horizontalArrangement=Arrangement.spacedBy(4.dp),verticalAlignment=Alignment.CenterVertically) {
                    OutlinedTextField(model.names[i],{model.name(i,it)},modifier=Modifier.weight(1.5f),singleLine=true,
                        textStyle=LocalTextStyle.current.copy(fontSize=11.sp))
                    OutlinedTextField(bids[i],{v->bids=bids.toMutableList().apply{set(i,v.filter{it.isDigit()}.take(2))}},
                        modifier=Modifier.weight(.65f),singleLine=true,textStyle=LocalTextStyle.current.copy(fontSize=12.sp),
                        keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number))
                    OutlinedTextField(taken[i],{v->taken=taken.toMutableList().apply{set(i,v.filter{it.isDigit()}.take(2))}},
                        modifier=Modifier.weight(.65f),singleLine=true,textStyle=LocalTextStyle.current.copy(fontSize=12.sp),
                        keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number))
                    Text(score.totals[i].toString(),Modifier.weight(.65f),fontSize=11.sp,textAlign=TextAlign.End)
                }
            }
            Text("აღებული ხელების ჯამი უნდა უდრიდეს დარიგებულ კარტებს ("+cards+").",
                fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
            if(info.isNotBlank())Text(info,fontSize=11.sp,color=MaterialTheme.colorScheme.primary)
            Button(onClick={
                val b=bids.map{it.toIntOrNull()?:-1};val t=taken.map{it.toIntOrNull()?:-1}
                info=if(model.add(b,t)){if(r==23)"პარტია დასრულდა და შეინახა ისტორიაში" else "დარიგება შენახულია"}
                    else "შეამოწმე 0–"+cards+" დიაპაზონი და აღებული ჯამი"
            },modifier=Modifier.fillMaxWidth()){Text("დარიგების შენახვა")}
            OutlinedButton(enabled=r>0,onClick={model.undo();info=""},modifier=Modifier.fillMaxWidth()){
                Text("ბოლო დარიგების დაბრუნება")}
        }
        ExtraCard {
            Text("პულკები • ჯამი და პრემია",fontWeight=FontWeight.Bold)
            JokerRules.groups.forEachIndexed{g,range->
                Text("პულკი "+(g+1)+" • "+(r-range.first).coerceIn(0,range.count())+"/"+range.count(),
                    fontSize=12.sp,fontWeight=FontWeight.Medium)
                Row {
                    for(p in 0..3)Column(Modifier.weight(1f),horizontalAlignment=Alignment.CenterHorizontally) {
                        Text(model.names[p].take(9),maxLines=1,fontSize=9.sp)
                        Text(score.group[g][p].toString(),fontSize=12.sp,fontWeight=FontWeight.Bold)
                        if(score.premiums[g][p]!=0)Text("%+d".format(Locale.US,score.premiums[g][p]),fontSize=9.sp)
                    }
                }
                HorizontalDivider()
            }
        }
        ExtraCard {
            Row(verticalAlignment=Alignment.CenterVertically) {
                Text("ნათამაშები პარტიები ("+model.matches.size+")",Modifier.weight(1f),fontWeight=FontWeight.Bold)
                TextButton(onClick={history=!history}){Text(if(history)"დამალვა" else "ნახვა")}
            }
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick={export.launch("DGIURI_joker_history.json")},modifier=Modifier.weight(1f)){
                    Text("ექსპორტი",fontSize=11.sp)}
                OutlinedButton(onClick={import.launch(arrayOf("application/json","text/plain"))},modifier=Modifier.weight(1f)){
                    Text("იმპორტი",fontSize=11.sp)}
            }
            if(history)model.matches.forEachIndexed{i,m->
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Column(Modifier.weight(1f).clickable{selected=m}.padding(vertical=5.dp)) {
                        Text(m.date,fontSize=12.sp,fontWeight=FontWeight.Bold)
                        Text(m.players.zip(m.points).joinToString(" • "){it.first+" "+it.second},
                            fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    TextButton(onClick={model.remove(i)}){Text("✕")}
                }
                HorizontalDivider()
            }
        }
        Text("პასი=50 • ზუსტი თქმა=(თქვა+1)×50 • ყველა კარტი=×100 • ხიშტი=−200 • პულკის პრემია",
            fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
    if(selected!=null)AlertDialog(onDismissRequest={selected=null},title={Text("ჯოკერი • პარტიის შედეგი")},
        text={Column {
            Text(selected!!.date)
            selected!!.players.zip(selected!!.points).forEach{(name,value)->Text(name+" — "+value)}
            Text("დარიგება: 24",fontSize=12.sp)
        }},confirmButton={TextButton(onClick={selected=null}){Text("დახურვა")}})
}

@Composable fun DiaryReminderMenu(store:PlannerStore) {
    var open by remember{mutableStateOf(false)}
    val options=listOf(-1 to "გამორთული",0 to "საქმის დაწყებისას",5 to "5 წუთით ადრე",
        15 to "15 წუთით ადრე",30 to "30 წუთით ადრე",1440 to "1 დღით ადრე")
    Box {
        OutlinedButton(onClick={open=true},modifier=Modifier.fillMaxWidth()){
            Text(options.firstOrNull{it.first==store.reminderDefault}?.second?:"გამორთული",Modifier.weight(1f))
            Text("▾")
        }
        DropdownMenu(open,onDismissRequest={open=false},containerColor=MaterialTheme.colorScheme.surface) {
            options.forEach{(code,label)->
                DropdownMenuItem(text={Text((if(code==store.reminderDefault)"✓  " else "")+label,
                    color=MaterialTheme.colorScheme.onSurface)},onClick={store.changeReminderDefault(code);open=false})
            }
        }
    }
}

@Composable private fun DiaryExactAlarmPermission() {
    val c=LocalContext.current
    val manager=remember { c.getSystemService(android.app.AlarmManager::class.java) }
    var allowed by remember { mutableStateOf(android.os.Build.VERSION.SDK_INT<31||manager.canScheduleExactAlarms()) }
    LaunchedEffect(allowed) { while(!allowed) { delay(1000); allowed=android.os.Build.VERSION.SDK_INT<31||manager.canScheduleExactAlarms() } }
    if(!allowed) ExtraCard {
        Text("ზუსტად დროზე დარეკვის ნებართვა",fontWeight=FontWeight.Bold)
        Text("სპეციალური ნებართვის გარეშე ტაიმერმა ან მაღვიძარამ შეიძლება დააგვიანოს.",
            fontSize=12.sp)
        OutlinedButton(onClick={
            runCatching {
                c.startActivity(android.content.Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                    android.net.Uri.parse("package:"+c.packageName)).addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK))
            }
        }) { Text("ზუსტი მაღვიძარების დაშვება") }
    }
}

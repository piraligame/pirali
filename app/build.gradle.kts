plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}
android {
    namespace = "ge.weeklyplus.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "ge.weeklyplus.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 5
        versionName = "0.11-alpha"
    }
    signingConfigs {
        create("diaryStable") {
            storeFile = file(System.getenv("DGIURI_KEY_FILE") ?: "C:/Users/punis/Documents/DIARY_ReleaseSigning/WEEKLY_PLUS_Stable_2026.jks")
            storePassword = System.getenv("DGIURI_KEY_PASSWORD") ?: ""
            keyAlias = "weeklyplus"
            keyPassword = System.getenv("DGIURI_KEY_PASSWORD") ?: ""
        }
    }
    buildTypes { release {
        isMinifyEnabled = false
        signingConfig = signingConfigs.getByName("diaryStable")
    } }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    packaging { resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" } }
}
dependencies {
    val bom = platform("androidx.compose:compose-bom:2025.12.00")
    implementation(bom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.11.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}

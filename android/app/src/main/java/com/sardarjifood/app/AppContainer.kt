package com.sardarjifood.app

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.sardarjifood.app.data.local.AppDatabase
import com.sardarjifood.app.data.local.SessionStore
import com.sardarjifood.app.data.network.SiteHttpClient
import com.sardarjifood.app.data.network.SupabaseHttpClient
import com.sardarjifood.app.data.network.createSharedHttpClient
import com.sardarjifood.app.data.repository.AdminRepository
import com.sardarjifood.app.data.repository.AuthRepository
import com.sardarjifood.app.data.repository.CartRepository
import com.sardarjifood.app.data.repository.CatalogRepository
import com.sardarjifood.app.data.repository.DeliveryRepository
import com.sardarjifood.app.data.repository.NativeAdminRepository
import com.sardarjifood.app.data.repository.NativeAuthRepository
import com.sardarjifood.app.data.repository.NativeCartRepository
import com.sardarjifood.app.data.repository.NativeCatalogRepository
import com.sardarjifood.app.data.repository.NativeDeliveryRepository
import com.sardarjifood.app.data.repository.NativeOrdersRepository
import com.sardarjifood.app.data.repository.NativeProfileRepository
import com.sardarjifood.app.data.repository.OrdersRepository
import com.sardarjifood.app.data.repository.ProfileRepository

class AppContainer(context: Context) {
    val gson: Gson = GsonBuilder().create()
    private val okHttpClient = createSharedHttpClient()
    private val database = AppDatabase.getInstance(context)
    private val sessionStore = SessionStore(context)
    private val supabaseHttpClient = SupabaseHttpClient(okHttpClient, gson)
    private val siteHttpClient = SiteHttpClient(okHttpClient, gson)

    val authRepository: AuthRepository =
        NativeAuthRepository(
            gson = gson,
            dao = database.appDao(),
            sessionStore = sessionStore,
            supabaseHttpClient = supabaseHttpClient,
        )

    val catalogRepository: CatalogRepository =
        NativeCatalogRepository(
            gson = gson,
            dao = database.appDao(),
            supabaseHttpClient = supabaseHttpClient,
        )

    val cartRepository: CartRepository =
        NativeCartRepository(
            gson = gson,
            dao = database.appDao(),
        )

    val ordersRepository: OrdersRepository =
        NativeOrdersRepository(
            gson = gson,
            dao = database.appDao(),
            authRepository = authRepository,
            supabaseHttpClient = supabaseHttpClient,
            siteHttpClient = siteHttpClient,
        )

    val profileRepository: ProfileRepository =
        NativeProfileRepository(
            gson = gson,
            dao = database.appDao(),
            authRepository = authRepository,
            supabaseHttpClient = supabaseHttpClient,
        )

    val adminRepository: AdminRepository =
        NativeAdminRepository(
            gson = gson,
            dao = database.appDao(),
            authRepository = authRepository,
            supabaseHttpClient = supabaseHttpClient,
        )

    val deliveryRepository: DeliveryRepository =
        NativeDeliveryRepository(
            authRepository = authRepository,
            ordersRepository = ordersRepository,
        )
}

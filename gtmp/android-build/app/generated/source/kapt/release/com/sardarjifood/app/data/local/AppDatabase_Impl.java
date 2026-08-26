package com.sardarjifood.app.data.local;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class AppDatabase_Impl extends AppDatabase {
  private volatile AppDao _appDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `snapshots` (`key` TEXT NOT NULL, `json` TEXT NOT NULL, `updatedAt` INTEGER NOT NULL, PRIMARY KEY(`key`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `cart_lines` (`lineId` TEXT NOT NULL, `productId` TEXT NOT NULL, `name` TEXT NOT NULL, `image` TEXT NOT NULL, `description` TEXT NOT NULL, `category` TEXT NOT NULL, `basePrice` INTEGER NOT NULL, `addonTotal` INTEGER NOT NULL, `price` INTEGER NOT NULL, `quantity` INTEGER NOT NULL, `badge` TEXT NOT NULL, `isVeg` INTEGER NOT NULL, `isAvailable` INTEGER NOT NULL, `isFreebie` INTEGER NOT NULL, `isAddonLine` INTEGER NOT NULL, `parentLineId` TEXT NOT NULL, `parentProductId` TEXT NOT NULL, `groupId` TEXT NOT NULL, `groupTitle` TEXT NOT NULL, `addonSummary` TEXT NOT NULL, `addonsJson` TEXT NOT NULL, PRIMARY KEY(`lineId`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, '9f023ee7ef293764676889c0b31feeb2')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `snapshots`");
        db.execSQL("DROP TABLE IF EXISTS `cart_lines`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsSnapshots = new HashMap<String, TableInfo.Column>(3);
        _columnsSnapshots.put("key", new TableInfo.Column("key", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSnapshots.put("json", new TableInfo.Column("json", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSnapshots.put("updatedAt", new TableInfo.Column("updatedAt", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysSnapshots = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesSnapshots = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoSnapshots = new TableInfo("snapshots", _columnsSnapshots, _foreignKeysSnapshots, _indicesSnapshots);
        final TableInfo _existingSnapshots = TableInfo.read(db, "snapshots");
        if (!_infoSnapshots.equals(_existingSnapshots)) {
          return new RoomOpenHelper.ValidationResult(false, "snapshots(com.sardarjifood.app.data.local.SnapshotEntity).\n"
                  + " Expected:\n" + _infoSnapshots + "\n"
                  + " Found:\n" + _existingSnapshots);
        }
        final HashMap<String, TableInfo.Column> _columnsCartLines = new HashMap<String, TableInfo.Column>(21);
        _columnsCartLines.put("lineId", new TableInfo.Column("lineId", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("productId", new TableInfo.Column("productId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("image", new TableInfo.Column("image", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("description", new TableInfo.Column("description", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("category", new TableInfo.Column("category", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("basePrice", new TableInfo.Column("basePrice", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("addonTotal", new TableInfo.Column("addonTotal", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("price", new TableInfo.Column("price", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("quantity", new TableInfo.Column("quantity", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("badge", new TableInfo.Column("badge", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("isVeg", new TableInfo.Column("isVeg", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("isAvailable", new TableInfo.Column("isAvailable", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("isFreebie", new TableInfo.Column("isFreebie", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("isAddonLine", new TableInfo.Column("isAddonLine", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("parentLineId", new TableInfo.Column("parentLineId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("parentProductId", new TableInfo.Column("parentProductId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("groupId", new TableInfo.Column("groupId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("groupTitle", new TableInfo.Column("groupTitle", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("addonSummary", new TableInfo.Column("addonSummary", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsCartLines.put("addonsJson", new TableInfo.Column("addonsJson", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysCartLines = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesCartLines = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoCartLines = new TableInfo("cart_lines", _columnsCartLines, _foreignKeysCartLines, _indicesCartLines);
        final TableInfo _existingCartLines = TableInfo.read(db, "cart_lines");
        if (!_infoCartLines.equals(_existingCartLines)) {
          return new RoomOpenHelper.ValidationResult(false, "cart_lines(com.sardarjifood.app.data.local.CartLineEntity).\n"
                  + " Expected:\n" + _infoCartLines + "\n"
                  + " Found:\n" + _existingCartLines);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "9f023ee7ef293764676889c0b31feeb2", "8a31a1834077cbfc311d495954770148");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "snapshots","cart_lines");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `snapshots`");
      _db.execSQL("DELETE FROM `cart_lines`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(AppDao.class, AppDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public AppDao appDao() {
    if (_appDao != null) {
      return _appDao;
    } else {
      synchronized(this) {
        if(_appDao == null) {
          _appDao = new AppDao_Impl(this);
        }
        return _appDao;
      }
    }
  }
}

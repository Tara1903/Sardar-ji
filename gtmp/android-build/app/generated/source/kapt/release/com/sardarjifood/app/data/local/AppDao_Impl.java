package com.sardarjifood.app.data.local;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class AppDao_Impl implements AppDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<SnapshotEntity> __insertionAdapterOfSnapshotEntity;

  private final EntityInsertionAdapter<CartLineEntity> __insertionAdapterOfCartLineEntity;

  private final SharedSQLiteStatement __preparedStmtOfDeleteSnapshot;

  private final SharedSQLiteStatement __preparedStmtOfRemoveCartLine;

  private final SharedSQLiteStatement __preparedStmtOfClearCart;

  public AppDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfSnapshotEntity = new EntityInsertionAdapter<SnapshotEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `snapshots` (`key`,`json`,`updatedAt`) VALUES (?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final SnapshotEntity entity) {
        if (entity.getKey() == null) {
          statement.bindNull(1);
        } else {
          statement.bindString(1, entity.getKey());
        }
        if (entity.getJson() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getJson());
        }
        statement.bindLong(3, entity.getUpdatedAt());
      }
    };
    this.__insertionAdapterOfCartLineEntity = new EntityInsertionAdapter<CartLineEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `cart_lines` (`lineId`,`productId`,`name`,`image`,`description`,`category`,`basePrice`,`addonTotal`,`price`,`quantity`,`badge`,`isVeg`,`isAvailable`,`isFreebie`,`isAddonLine`,`parentLineId`,`parentProductId`,`groupId`,`groupTitle`,`addonSummary`,`addonsJson`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final CartLineEntity entity) {
        if (entity.getLineId() == null) {
          statement.bindNull(1);
        } else {
          statement.bindString(1, entity.getLineId());
        }
        if (entity.getProductId() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getProductId());
        }
        if (entity.getName() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getName());
        }
        if (entity.getImage() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getImage());
        }
        if (entity.getDescription() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getDescription());
        }
        if (entity.getCategory() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getCategory());
        }
        statement.bindLong(7, entity.getBasePrice());
        statement.bindLong(8, entity.getAddonTotal());
        statement.bindLong(9, entity.getPrice());
        statement.bindLong(10, entity.getQuantity());
        if (entity.getBadge() == null) {
          statement.bindNull(11);
        } else {
          statement.bindString(11, entity.getBadge());
        }
        final int _tmp = entity.isVeg() ? 1 : 0;
        statement.bindLong(12, _tmp);
        final int _tmp_1 = entity.isAvailable() ? 1 : 0;
        statement.bindLong(13, _tmp_1);
        final int _tmp_2 = entity.isFreebie() ? 1 : 0;
        statement.bindLong(14, _tmp_2);
        final int _tmp_3 = entity.isAddonLine() ? 1 : 0;
        statement.bindLong(15, _tmp_3);
        if (entity.getParentLineId() == null) {
          statement.bindNull(16);
        } else {
          statement.bindString(16, entity.getParentLineId());
        }
        if (entity.getParentProductId() == null) {
          statement.bindNull(17);
        } else {
          statement.bindString(17, entity.getParentProductId());
        }
        if (entity.getGroupId() == null) {
          statement.bindNull(18);
        } else {
          statement.bindString(18, entity.getGroupId());
        }
        if (entity.getGroupTitle() == null) {
          statement.bindNull(19);
        } else {
          statement.bindString(19, entity.getGroupTitle());
        }
        if (entity.getAddonSummary() == null) {
          statement.bindNull(20);
        } else {
          statement.bindString(20, entity.getAddonSummary());
        }
        if (entity.getAddonsJson() == null) {
          statement.bindNull(21);
        } else {
          statement.bindString(21, entity.getAddonsJson());
        }
      }
    };
    this.__preparedStmtOfDeleteSnapshot = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM snapshots WHERE `key` = ?";
        return _query;
      }
    };
    this.__preparedStmtOfRemoveCartLine = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM cart_lines WHERE lineId = ?";
        return _query;
      }
    };
    this.__preparedStmtOfClearCart = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM cart_lines";
        return _query;
      }
    };
  }

  @Override
  public Object upsertSnapshot(final SnapshotEntity snapshot,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfSnapshotEntity.insert(snapshot);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object upsertCartLine(final CartLineEntity line,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfCartLineEntity.insert(line);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteSnapshot(final String key, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteSnapshot.acquire();
        int _argIndex = 1;
        if (key == null) {
          _stmt.bindNull(_argIndex);
        } else {
          _stmt.bindString(_argIndex, key);
        }
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteSnapshot.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object removeCartLine(final String lineId, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfRemoveCartLine.acquire();
        int _argIndex = 1;
        if (lineId == null) {
          _stmt.bindNull(_argIndex);
        } else {
          _stmt.bindString(_argIndex, lineId);
        }
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfRemoveCartLine.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object clearCart(final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfClearCart.acquire();
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfClearCart.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object getSnapshot(final String key,
      final Continuation<? super SnapshotEntity> $completion) {
    final String _sql = "SELECT * FROM snapshots WHERE `key` = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    if (key == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, key);
    }
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<SnapshotEntity>() {
      @Override
      @Nullable
      public SnapshotEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfKey = CursorUtil.getColumnIndexOrThrow(_cursor, "key");
          final int _cursorIndexOfJson = CursorUtil.getColumnIndexOrThrow(_cursor, "json");
          final int _cursorIndexOfUpdatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "updatedAt");
          final SnapshotEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpKey;
            if (_cursor.isNull(_cursorIndexOfKey)) {
              _tmpKey = null;
            } else {
              _tmpKey = _cursor.getString(_cursorIndexOfKey);
            }
            final String _tmpJson;
            if (_cursor.isNull(_cursorIndexOfJson)) {
              _tmpJson = null;
            } else {
              _tmpJson = _cursor.getString(_cursorIndexOfJson);
            }
            final long _tmpUpdatedAt;
            _tmpUpdatedAt = _cursor.getLong(_cursorIndexOfUpdatedAt);
            _result = new SnapshotEntity(_tmpKey,_tmpJson,_tmpUpdatedAt);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<CartLineEntity>> observeCartLines() {
    final String _sql = "SELECT * FROM cart_lines ORDER BY name ASC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"cart_lines"}, new Callable<List<CartLineEntity>>() {
      @Override
      @NonNull
      public List<CartLineEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfLineId = CursorUtil.getColumnIndexOrThrow(_cursor, "lineId");
          final int _cursorIndexOfProductId = CursorUtil.getColumnIndexOrThrow(_cursor, "productId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfImage = CursorUtil.getColumnIndexOrThrow(_cursor, "image");
          final int _cursorIndexOfDescription = CursorUtil.getColumnIndexOrThrow(_cursor, "description");
          final int _cursorIndexOfCategory = CursorUtil.getColumnIndexOrThrow(_cursor, "category");
          final int _cursorIndexOfBasePrice = CursorUtil.getColumnIndexOrThrow(_cursor, "basePrice");
          final int _cursorIndexOfAddonTotal = CursorUtil.getColumnIndexOrThrow(_cursor, "addonTotal");
          final int _cursorIndexOfPrice = CursorUtil.getColumnIndexOrThrow(_cursor, "price");
          final int _cursorIndexOfQuantity = CursorUtil.getColumnIndexOrThrow(_cursor, "quantity");
          final int _cursorIndexOfBadge = CursorUtil.getColumnIndexOrThrow(_cursor, "badge");
          final int _cursorIndexOfIsVeg = CursorUtil.getColumnIndexOrThrow(_cursor, "isVeg");
          final int _cursorIndexOfIsAvailable = CursorUtil.getColumnIndexOrThrow(_cursor, "isAvailable");
          final int _cursorIndexOfIsFreebie = CursorUtil.getColumnIndexOrThrow(_cursor, "isFreebie");
          final int _cursorIndexOfIsAddonLine = CursorUtil.getColumnIndexOrThrow(_cursor, "isAddonLine");
          final int _cursorIndexOfParentLineId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentLineId");
          final int _cursorIndexOfParentProductId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentProductId");
          final int _cursorIndexOfGroupId = CursorUtil.getColumnIndexOrThrow(_cursor, "groupId");
          final int _cursorIndexOfGroupTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "groupTitle");
          final int _cursorIndexOfAddonSummary = CursorUtil.getColumnIndexOrThrow(_cursor, "addonSummary");
          final int _cursorIndexOfAddonsJson = CursorUtil.getColumnIndexOrThrow(_cursor, "addonsJson");
          final List<CartLineEntity> _result = new ArrayList<CartLineEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final CartLineEntity _item;
            final String _tmpLineId;
            if (_cursor.isNull(_cursorIndexOfLineId)) {
              _tmpLineId = null;
            } else {
              _tmpLineId = _cursor.getString(_cursorIndexOfLineId);
            }
            final String _tmpProductId;
            if (_cursor.isNull(_cursorIndexOfProductId)) {
              _tmpProductId = null;
            } else {
              _tmpProductId = _cursor.getString(_cursorIndexOfProductId);
            }
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpImage;
            if (_cursor.isNull(_cursorIndexOfImage)) {
              _tmpImage = null;
            } else {
              _tmpImage = _cursor.getString(_cursorIndexOfImage);
            }
            final String _tmpDescription;
            if (_cursor.isNull(_cursorIndexOfDescription)) {
              _tmpDescription = null;
            } else {
              _tmpDescription = _cursor.getString(_cursorIndexOfDescription);
            }
            final String _tmpCategory;
            if (_cursor.isNull(_cursorIndexOfCategory)) {
              _tmpCategory = null;
            } else {
              _tmpCategory = _cursor.getString(_cursorIndexOfCategory);
            }
            final int _tmpBasePrice;
            _tmpBasePrice = _cursor.getInt(_cursorIndexOfBasePrice);
            final int _tmpAddonTotal;
            _tmpAddonTotal = _cursor.getInt(_cursorIndexOfAddonTotal);
            final int _tmpPrice;
            _tmpPrice = _cursor.getInt(_cursorIndexOfPrice);
            final int _tmpQuantity;
            _tmpQuantity = _cursor.getInt(_cursorIndexOfQuantity);
            final String _tmpBadge;
            if (_cursor.isNull(_cursorIndexOfBadge)) {
              _tmpBadge = null;
            } else {
              _tmpBadge = _cursor.getString(_cursorIndexOfBadge);
            }
            final boolean _tmpIsVeg;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsVeg);
            _tmpIsVeg = _tmp != 0;
            final boolean _tmpIsAvailable;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsAvailable);
            _tmpIsAvailable = _tmp_1 != 0;
            final boolean _tmpIsFreebie;
            final int _tmp_2;
            _tmp_2 = _cursor.getInt(_cursorIndexOfIsFreebie);
            _tmpIsFreebie = _tmp_2 != 0;
            final boolean _tmpIsAddonLine;
            final int _tmp_3;
            _tmp_3 = _cursor.getInt(_cursorIndexOfIsAddonLine);
            _tmpIsAddonLine = _tmp_3 != 0;
            final String _tmpParentLineId;
            if (_cursor.isNull(_cursorIndexOfParentLineId)) {
              _tmpParentLineId = null;
            } else {
              _tmpParentLineId = _cursor.getString(_cursorIndexOfParentLineId);
            }
            final String _tmpParentProductId;
            if (_cursor.isNull(_cursorIndexOfParentProductId)) {
              _tmpParentProductId = null;
            } else {
              _tmpParentProductId = _cursor.getString(_cursorIndexOfParentProductId);
            }
            final String _tmpGroupId;
            if (_cursor.isNull(_cursorIndexOfGroupId)) {
              _tmpGroupId = null;
            } else {
              _tmpGroupId = _cursor.getString(_cursorIndexOfGroupId);
            }
            final String _tmpGroupTitle;
            if (_cursor.isNull(_cursorIndexOfGroupTitle)) {
              _tmpGroupTitle = null;
            } else {
              _tmpGroupTitle = _cursor.getString(_cursorIndexOfGroupTitle);
            }
            final String _tmpAddonSummary;
            if (_cursor.isNull(_cursorIndexOfAddonSummary)) {
              _tmpAddonSummary = null;
            } else {
              _tmpAddonSummary = _cursor.getString(_cursorIndexOfAddonSummary);
            }
            final String _tmpAddonsJson;
            if (_cursor.isNull(_cursorIndexOfAddonsJson)) {
              _tmpAddonsJson = null;
            } else {
              _tmpAddonsJson = _cursor.getString(_cursorIndexOfAddonsJson);
            }
            _item = new CartLineEntity(_tmpLineId,_tmpProductId,_tmpName,_tmpImage,_tmpDescription,_tmpCategory,_tmpBasePrice,_tmpAddonTotal,_tmpPrice,_tmpQuantity,_tmpBadge,_tmpIsVeg,_tmpIsAvailable,_tmpIsFreebie,_tmpIsAddonLine,_tmpParentLineId,_tmpParentProductId,_tmpGroupId,_tmpGroupTitle,_tmpAddonSummary,_tmpAddonsJson);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getCartLines(final Continuation<? super List<CartLineEntity>> $completion) {
    final String _sql = "SELECT * FROM cart_lines ORDER BY name ASC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<CartLineEntity>>() {
      @Override
      @NonNull
      public List<CartLineEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfLineId = CursorUtil.getColumnIndexOrThrow(_cursor, "lineId");
          final int _cursorIndexOfProductId = CursorUtil.getColumnIndexOrThrow(_cursor, "productId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfImage = CursorUtil.getColumnIndexOrThrow(_cursor, "image");
          final int _cursorIndexOfDescription = CursorUtil.getColumnIndexOrThrow(_cursor, "description");
          final int _cursorIndexOfCategory = CursorUtil.getColumnIndexOrThrow(_cursor, "category");
          final int _cursorIndexOfBasePrice = CursorUtil.getColumnIndexOrThrow(_cursor, "basePrice");
          final int _cursorIndexOfAddonTotal = CursorUtil.getColumnIndexOrThrow(_cursor, "addonTotal");
          final int _cursorIndexOfPrice = CursorUtil.getColumnIndexOrThrow(_cursor, "price");
          final int _cursorIndexOfQuantity = CursorUtil.getColumnIndexOrThrow(_cursor, "quantity");
          final int _cursorIndexOfBadge = CursorUtil.getColumnIndexOrThrow(_cursor, "badge");
          final int _cursorIndexOfIsVeg = CursorUtil.getColumnIndexOrThrow(_cursor, "isVeg");
          final int _cursorIndexOfIsAvailable = CursorUtil.getColumnIndexOrThrow(_cursor, "isAvailable");
          final int _cursorIndexOfIsFreebie = CursorUtil.getColumnIndexOrThrow(_cursor, "isFreebie");
          final int _cursorIndexOfIsAddonLine = CursorUtil.getColumnIndexOrThrow(_cursor, "isAddonLine");
          final int _cursorIndexOfParentLineId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentLineId");
          final int _cursorIndexOfParentProductId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentProductId");
          final int _cursorIndexOfGroupId = CursorUtil.getColumnIndexOrThrow(_cursor, "groupId");
          final int _cursorIndexOfGroupTitle = CursorUtil.getColumnIndexOrThrow(_cursor, "groupTitle");
          final int _cursorIndexOfAddonSummary = CursorUtil.getColumnIndexOrThrow(_cursor, "addonSummary");
          final int _cursorIndexOfAddonsJson = CursorUtil.getColumnIndexOrThrow(_cursor, "addonsJson");
          final List<CartLineEntity> _result = new ArrayList<CartLineEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final CartLineEntity _item;
            final String _tmpLineId;
            if (_cursor.isNull(_cursorIndexOfLineId)) {
              _tmpLineId = null;
            } else {
              _tmpLineId = _cursor.getString(_cursorIndexOfLineId);
            }
            final String _tmpProductId;
            if (_cursor.isNull(_cursorIndexOfProductId)) {
              _tmpProductId = null;
            } else {
              _tmpProductId = _cursor.getString(_cursorIndexOfProductId);
            }
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpImage;
            if (_cursor.isNull(_cursorIndexOfImage)) {
              _tmpImage = null;
            } else {
              _tmpImage = _cursor.getString(_cursorIndexOfImage);
            }
            final String _tmpDescription;
            if (_cursor.isNull(_cursorIndexOfDescription)) {
              _tmpDescription = null;
            } else {
              _tmpDescription = _cursor.getString(_cursorIndexOfDescription);
            }
            final String _tmpCategory;
            if (_cursor.isNull(_cursorIndexOfCategory)) {
              _tmpCategory = null;
            } else {
              _tmpCategory = _cursor.getString(_cursorIndexOfCategory);
            }
            final int _tmpBasePrice;
            _tmpBasePrice = _cursor.getInt(_cursorIndexOfBasePrice);
            final int _tmpAddonTotal;
            _tmpAddonTotal = _cursor.getInt(_cursorIndexOfAddonTotal);
            final int _tmpPrice;
            _tmpPrice = _cursor.getInt(_cursorIndexOfPrice);
            final int _tmpQuantity;
            _tmpQuantity = _cursor.getInt(_cursorIndexOfQuantity);
            final String _tmpBadge;
            if (_cursor.isNull(_cursorIndexOfBadge)) {
              _tmpBadge = null;
            } else {
              _tmpBadge = _cursor.getString(_cursorIndexOfBadge);
            }
            final boolean _tmpIsVeg;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsVeg);
            _tmpIsVeg = _tmp != 0;
            final boolean _tmpIsAvailable;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsAvailable);
            _tmpIsAvailable = _tmp_1 != 0;
            final boolean _tmpIsFreebie;
            final int _tmp_2;
            _tmp_2 = _cursor.getInt(_cursorIndexOfIsFreebie);
            _tmpIsFreebie = _tmp_2 != 0;
            final boolean _tmpIsAddonLine;
            final int _tmp_3;
            _tmp_3 = _cursor.getInt(_cursorIndexOfIsAddonLine);
            _tmpIsAddonLine = _tmp_3 != 0;
            final String _tmpParentLineId;
            if (_cursor.isNull(_cursorIndexOfParentLineId)) {
              _tmpParentLineId = null;
            } else {
              _tmpParentLineId = _cursor.getString(_cursorIndexOfParentLineId);
            }
            final String _tmpParentProductId;
            if (_cursor.isNull(_cursorIndexOfParentProductId)) {
              _tmpParentProductId = null;
            } else {
              _tmpParentProductId = _cursor.getString(_cursorIndexOfParentProductId);
            }
            final String _tmpGroupId;
            if (_cursor.isNull(_cursorIndexOfGroupId)) {
              _tmpGroupId = null;
            } else {
              _tmpGroupId = _cursor.getString(_cursorIndexOfGroupId);
            }
            final String _tmpGroupTitle;
            if (_cursor.isNull(_cursorIndexOfGroupTitle)) {
              _tmpGroupTitle = null;
            } else {
              _tmpGroupTitle = _cursor.getString(_cursorIndexOfGroupTitle);
            }
            final String _tmpAddonSummary;
            if (_cursor.isNull(_cursorIndexOfAddonSummary)) {
              _tmpAddonSummary = null;
            } else {
              _tmpAddonSummary = _cursor.getString(_cursorIndexOfAddonSummary);
            }
            final String _tmpAddonsJson;
            if (_cursor.isNull(_cursorIndexOfAddonsJson)) {
              _tmpAddonsJson = null;
            } else {
              _tmpAddonsJson = _cursor.getString(_cursorIndexOfAddonsJson);
            }
            _item = new CartLineEntity(_tmpLineId,_tmpProductId,_tmpName,_tmpImage,_tmpDescription,_tmpCategory,_tmpBasePrice,_tmpAddonTotal,_tmpPrice,_tmpQuantity,_tmpBadge,_tmpIsVeg,_tmpIsAvailable,_tmpIsFreebie,_tmpIsAddonLine,_tmpParentLineId,_tmpParentProductId,_tmpGroupId,_tmpGroupTitle,_tmpAddonSummary,_tmpAddonsJson);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}

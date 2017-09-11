package com.csr.mesh;

import com.csr.mesh.LightModelApi;
import com.csr.mesh.Packet;
import com.csr.mesh.f;

public final class SuperLightModelApi {
   public static final int MODEL_NUMBER = 20;

   public static void closeGatt(int var0) {
   }

   public static void setColorTemperature(int var0, byte[] var1) {
      Packet var2 = e.a().a(16, (byte)-118, e.a().f(), var0);
      var2.a((byte)2, 8);
      var2.a(var1[0], 9);
      var2.a(var1[1], 10);
      var2.a(var1[2], 11);
      var2.a(var1[3], 12);
      var2.a(var1[4], 13);
      var2.a(var1[5], 14);
      var2.a(e.a().e(), 15);
      e.a().f(var2);
   }

   public static void setLevel(int var0, byte var1, boolean var2) {
      LightModelApi.setLevel(var0, var1, var2);
   }

   public static void setRgb(int var0, byte var1, byte var2, byte var3, byte var4, byte var5, boolean var6) {
      Packet var7 = e.a().a(16, (byte)-118, e.a().f(), var0);
      var7.a((byte)2, 8);
      var7.a(var4, 9);
      var7.a(var1, 10);
      var7.a(var2, 11);
      var7.a(var3, 12);
      var7.a(var5, 13);
      var7.a((byte)0, 14);
      var7.a(e.a().e(), 15);
      e.a().f(var7);
   }

   static final class SET_COLOR_TEMP {
      static final int LENGTH = 14;
      static final int OFFSET_COLOR_TEMP = 9;
      static final int OFFSET_DURATION = 11;
      static final int OFFSET_SUB_CODE = 8;
      static final int OFFSET_TID = 13;
      static final byte OPCODE = -118;
      static final byte SUB_CODE = 6;
   }

   static final class SET_COLOR_TEMP_NO_ACK {
      static final int LENGTH = 14;
      static final int OFFSET_COLOR_TEMP = 9;
      static final int OFFSET_DURATION = 11;
      static final int OFFSET_SUB_CODE = 8;
      static final byte OPCODE = -118;
      static final byte SUB_CODE = 4;
   }
}

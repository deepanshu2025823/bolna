// app/api/admin/users/revert/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const backupToken = cookieStore.get('admin_backup_token')?.value;

    if (!backupToken) {
      return NextResponse.json({ success: false, message: 'No admin session found to restore' }, { status: 400 });
    }

    cookieStore.set('auth_token', backupToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, 
    });

    cookieStore.delete('admin_backup_token');

    return NextResponse.json({ success: true, message: 'Restored admin session successfully' });
  } catch (error: any) {
    console.error("Revert Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to revert to admin' }, { status: 500 });
  }
}
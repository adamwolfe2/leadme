export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Reset admin password - DELETE after use

export async function POST() {
  try {
    const admin = createAdminClient()

    const ADMIN_EMAIL = 'adam@meetcursive.com'
    const NEW_PASSWORD = 'AdminPass123'

    // Find user by email
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find(u => u.email === ADMIN_EMAIL)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Run /api/admin/bootstrap first.' },
        { status: 404 }
      )
    }

    // Force update password
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: NEW_PASSWORD,
      email_confirm: true
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      email: ADMIN_EMAIL,
      new_password: NEW_PASSWORD,
      instruction: 'Try logging in now. DELETE this file after use.'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

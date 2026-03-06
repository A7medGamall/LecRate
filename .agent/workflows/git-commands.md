---
description: Git version control commands for the LecRate project
---

# Git Commands for LecRate

This project uses Git for version control. The Git executable is at `C:\progra~1\Git\bin\git.exe`.

The user (Ahmed) does NOT use a terminal — all Git commands should be run by the assistant on their behalf.

## Save current changes (حفظ التعديلات)

When the user says "احفظ النسخة دي" or "save this version":
// turbo

1. `C:\progra~1\Git\bin\git.exe add .`
2. `C:\progra~1\Git\bin\git.exe commit -m "وصف التعديل"`

## Revert to last saved version (الرجوع للنسخة السابقة)

When the user says "رجعني للنسخة اللي قبلها" or "revert":

1. `C:\progra~1\Git\bin\git.exe checkout .`

## Check what changed (شوف إيه اللي اتغيّر)

When the user says "إيه اللي اتغيّر" or "what changed":
// turbo

1. `C:\progra~1\Git\bin\git.exe status`
   // turbo
2. `C:\progra~1\Git\bin\git.exe diff --stat`

## Live Deployment (نشر التعديلات على الموقع اللايف)

When the user says "ارفع التعديلات دي لايف" or "deploy live":

1. `C:\progra~1\Git\bin\git.exe checkout master`
2. `C:\progra~1\Git\bin\git.exe merge development`
3. `C:\progra~1\Git\bin\git.exe push origin master`
4. `C:\progra~1\Git\bin\git.exe checkout development`

## Push Development Branch (حفظ التجربة على جيت هب)

When the user says "ارفع التعديلات التجريبية" or "push dev":

1. `C:\progra~1\Git\bin\git.exe push origin development`

## View history (تاريخ التعديلات)

// turbo

1. `C:\progra~1\Git\bin\git.exe log --oneline -n 10`

## Important Notes

- The `.env.local` file contains real Supabase credentials and is excluded from Git via `.gitignore`
- The first commit is: `v1.0 - النسخة الشغالة الأولى - RateMyLecture`
- The project is at: `D:\Projects\rate-my-lecture`
- Dev server: `node ./node_modules/next/dist/bin/next dev --port 3000`
- The Supabase project URL: `https://snugooudfnhsduislymf.supabase.co`

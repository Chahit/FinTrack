$apiDir = "src/app/api"
$files = Get-ChildItem -Path $apiDir -Recurse -Filter "route.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace Clerk imports with NextAuth
    $content = $content -replace "import \{ .*? \} from '@clerk/nextjs.*?';", "import { getServerSession } from 'next-auth/next';`nimport { authOptions } from '@/app/api/auth/[...nextauth]/route';"
    
    # Replace auth() calls with getServerSession
    $content = $content -replace "const \{ userId \} = (?:await )?auth\(\);", "const session = await getServerSession(authOptions);`nif (!session?.user) {`n  return new NextResponse('Unauthorized', { status: 401 });`n}`nconst userId = session.user.id;"
    
    # Save the modified content
    $content | Set-Content $file.FullName -NoNewline
}

Write-Host "Migration complete. Please review the changes manually."

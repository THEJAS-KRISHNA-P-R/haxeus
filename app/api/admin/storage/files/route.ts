import { NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase-admin"


export async function GET(request: Request) {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const supabaseAdmin = getSupabaseAdmin()


    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get("bucket") ?? ""
    const folder = searchParams.get("folder") ?? ""
    const search = searchParams.get("search") ?? ""
    const limit = parseInt(searchParams.get("limit") ?? "50")
    const offset = parseInt(searchParams.get("offset") ?? "0")

    if (!bucket) return NextResponse.json({ error: "bucket required" }, { status: 400 })

    const { data: files, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(folder, {
        limit,
        offset,
        search,
        sortBy: { column: "created_at", order: "desc" }
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Attach public URLs
    const filesWithUrls = (files ?? [])
      .filter(f => f.name !== ".emptyFolderPlaceholder")
      .map(file => {
        const path = folder ? `${folder}/${file.name}` : file.name
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(path)
        return {
          ...file,
          path,
          publicUrl,
          isFolder: file.metadata === null  // folders have null metadata
        }
      })

    return NextResponse.json({ files: filesWithUrls, bucket, folder })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const supabaseAdmin = getSupabaseAdmin()


    const { bucket, paths } = await request.json()

    if (!bucket || !paths?.length) {
      return NextResponse.json({ error: "bucket and paths required" }, { status: 400 })
    }

    if (paths.length > 50) {
      return NextResponse.json({ error: "max 50 files per request" }, { status: 400 })
    }

    // Validate each path is a string (prevent non-string injection)
    if (!paths.every((p: unknown) => typeof p === "string")) {
      return NextResponse.json({ error: "invalid paths" }, { status: 400 })
    }

    // Fix 3: Validate bucket name against actual bucket list
    const { data: validBuckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    if (bucketsError) return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    const validBucketNames = (validBuckets ?? []).map(b => b.name)

    if (!validBucketNames.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, deleted: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

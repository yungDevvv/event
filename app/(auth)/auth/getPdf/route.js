// app/api/getPdf/route.js
import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const invintation_id = searchParams.get("invintation_id");

    const { data, error } = await supabase
        .from("events")
        .select("instructions_file") 
        .eq("invintation_id", invintation_id)
        .single(); 

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(data)
    const pdfUrl = "https://supa.crossmedia.fi/storage/v1/object/" + data.instructions_file;

    return NextResponse.redirect(pdfUrl);
}

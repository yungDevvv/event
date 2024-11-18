"use client";



import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import CKeditor from '@/components/ck-editor';

const SettingsDescriptionForm = ({recordExists, user, welcome_text }) => {
	const [content, setContent] = useState(welcome_text ? welcome_text : "");
	const { toast } = useToast();
	const supabase = createClient();

	const handleChange = (event, editor) => {
		const data = editor.getData();
		setContent(data);
	};

	const handleSave = async () => {
		if (recordExists === false) {
			const { error } = await supabase
				.from("client_data")
				.insert({ user_id: user.id, welcome_text: content })

			if (error) {
				console.error(error);
				toast({
					variant: "supabaseError",
					description: "Tuntematon virhe tiedon tallentamisessa."
				})
				return;
			}

			toast({
				variant: "success",
				title: "Onnistui!",
				description: "Tiedon tallentaminen onnistui."
			})
		} else {
			const { error } = await supabase
				.from("client_data")
				.update({ welcome_text: content })
				.eq("user_id", user.id)

			if (error) {
				console.error(error);
				toast({
					variant: "supabaseError",
					description: "Tuntematon virhe tiedon päivittämisessa."
				})
				return;
			}

			toast({
				variant: "success",
				title: "Onnistui!",
				description: "Tiedon päivittäminen onnistui."
			})
		}
	};

	return (
		<div className='w-full'>
			<div className='w-full max-w-[40%] mr-5'>
				<h1 className='font-semibold'>Tervehdysteksti</h1>
				<p className='text-zinc-600 leading-tight'>Tervehdys näkyy kaikille osallistujille tapahtuman etusivulla.</p>
			</div>
			<div className="w-full mt-5">
				<CKeditor content={content} handleChange={handleChange} />
				<Button
					onClick={handleSave}
					className="bg-orange-400 hover:bg-orange-500 mt-2"
				>
					Tallenna
				</Button>
			</div>
		</div>
	);
}

export default SettingsDescriptionForm;
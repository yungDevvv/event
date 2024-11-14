"use client";



import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import CKeditor from '@/components/ck-editor';

const SettingsOtherForm = ({ recordExists, user, sub_description }) => {
	const [content, setContent] = useState(sub_description ? sub_description : "");
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
				.insert({ user_id: user.id, sub_description: content })

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
				.update({ sub_description: content })
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
		<div className='w-full flex'>
			<div className='w-full max-w-[40%] mr-5'>
				<h1 className='font-semibold'>Tapahtuman lisätiedot</h1>
				<p className='text-zinc-600 leading-tight'>Voit lisätä tähän kaikki tapahtumaan liittyvät lisätiedot, jotka voivat olla hyödyllisiä osallistujille.</p>
			</div>
			<div className="w-full max-w-[59%]">
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

export default SettingsOtherForm;
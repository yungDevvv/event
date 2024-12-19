"use client";

import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CKeditor = dynamic(() => import('@/components/ck-editor'), {
	ssr: false, 
	loading: () => <div className='w-full min-h-[190px] flex justify-center items-center py-10'><Loader2 className='animate-spin text-clientprimary' /></div>
 });

const SettingsDescriptionForm = ({ recordExists, user, fi_welcome_text, en_welcome_text }) => {
	const [fiContent, setFiContent] = useState(fi_welcome_text ? fi_welcome_text : "");
	const [enContent, setEnContent] = useState(en_welcome_text ? en_welcome_text : "");
	const { toast } = useToast();
	const supabase = createClient();

	const handleFiContentChange = (event, editor) => { 
		const data = editor.getData();
		setFiContent(data);
	};

	const handleEnContentChange = (event, editor) => {
		const data = editor.getData();
		setEnContent(data);
	};

	const handleSave = async () => {
		if (recordExists === false) {
			const { error } = await supabase
				.from("client_data")
				.insert({ user_id: user.id, fi_welcome_text: fiContent, en_welcome_text: enContent })

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
				title: "Tieto",
				description: "Tiedon tallentaminen onnistui."
			})
		} else {
			const { error } = await supabase
				.from("client_data")
				.update({ fi_welcome_text: fiContent, en_welcome_text: enContent })
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
				title: "Tieto",
				description: "Tiedon päivittäminen onnistui."
			})
		}
	};

	return (
		<div className='w-full'>
			<div className='w-full mr-5'>
				<h1 className='font-semibold'>Tervehdysteksti</h1>
				<p className='text-zinc-600 leading-tight'>Tervehdys näkyy kaikille osallistujille tapahtuman etusivulla.</p>
			</div>
			<div className="w-full mt-5">
				<div className='flex max-xl:flex-wrap'>
					<div className='max-w-[50%] w-full mr-3 max-xl:max-w-full max-xl:mb-2 min-h-[190px]'>
						<h3 className='font-medium'>FI</h3>
						<CKeditor content={fiContent} handleChange={handleFiContentChange} />
					</div>
					<div className='max-w-[50%] w-full ml-3 max-xl:max-w-full max-xl:ml-0 min-h-[190px]'>
						<h3 className='font-medium'>EN</h3>
						<CKeditor content={enContent} handleChange={handleEnContentChange} />
					</div>
				</div>
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
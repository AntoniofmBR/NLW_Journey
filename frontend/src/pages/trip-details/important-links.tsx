import { Link2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../../components/button';
import { api } from '../../lib/axios';
import { CreateLinkModal } from './create-link-modal';

interface Link {
  id: string
  title: string
  url: string
}

export function ImportantLinks() {
  const { tripId } = useParams()
  const [links, setParticipants] = useState<Link[]>([])
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false)


  useEffect(() => {
    api.get(`/trips/${tripId}/links`).then(res => setParticipants(res.data.links))
  }, [tripId])

  function openCreateLinkModal() {
    setIsCreateLinkModalOpen(true)
  }

  function closeCreateLinkModal() {
    setIsCreateLinkModalOpen(false)
  }


  return (
    <div className='space-y-6'>
    <h2 className='font-semibold text-xl'>
      Links importantes
    </h2>

    { links.map((link) => {
      return (
        <div key={link.id} className='space-y-5'>
        <div className='flex items-center justify-between gap-4'>
          <div className='space-y-1.5'>
            <span className='block font-medium text-zinc-100'>
              { link.title }
            </span>
            <a  href='#' className='block text-xs text-zinc-400 truncate hover:text-zinc-200'>
              { link.url }
            </a>
          </div>
          <Link2 className='text-zinc-400 size-5 shrink-0'/>
        </div>
    </div> 
      )
    })}

    <Button
      onClick={openCreateLinkModal}
      variant='secondary'
      size='full'
      className='bg-zinc-800 w-full justify-center text-zinc-200 rounded-lg px-5 h-11 font-medium flex items-center gap-2 hover:bg-zinc-700'>
        <Plus className='size-5'/>
        Cadastrar novo link
    </Button>

    { isCreateLinkModalOpen && (
        <CreateLinkModal 
        closeCreateLinkModal={closeCreateLinkModal}
        />
      )}
  </div>
  )
}
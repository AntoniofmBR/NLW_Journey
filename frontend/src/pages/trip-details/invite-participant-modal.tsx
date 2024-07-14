import { X, User, Mail } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { api } from '../../lib/axios';
import { Button } from '../../components/button';

interface InviteParticipantModalProps {
  closeInviteParticipantModal: () => void
}

export function InviteParticipantModal({
  closeInviteParticipantModal,
}: InviteParticipantModalProps) {
  const { tripId } = useParams()

  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

    async function getTripDetails()  { 
      const res = await api.get(`/trips/${tripId}`) 
      
      const destination = res.data.trip.destination
      const starts_at = res.data.trip.starts_at
      const ends_at = res.data.trip.ends_at

      console.log(res.data)

      setDestination(destination)
      setStartDate(starts_at)
      setEndDate(ends_at)
    }

    useEffect(() => {
      getTripDetails()
    })

  async function inviteParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const name = data.get('name')?.toString()
    const email = data.get('email')?.toString()

    await api.post(`/trips/${tripId}/invites`, {
      name,
      email,
    })

    window.document.location.reload()
  }

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
    <div className='w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>
              Confirmar participação
            </h2>
            <button
            type='button'
            onClick={closeInviteParticipantModal}
            >
              <X className='size-5 text-zinc-400'/>
            </button>
            </div>
            <p className='text-sm text-zinc-400'>
            Você foi convidado para participar de uma viagem para 
            <span className='font-semibold ml-1 mr-1 text-zinc-100'>{ destination }</span> 
            nas datas de <span className='font-semibold text-zinc-100 ml-1'>{ startDate } ate { endDate }</span>
            </p>
            <p className='text-sm text-zinc-400 pt-3'>
              Para confirmar a sua presença na viagem, preencha os dados abaixo:
            </p>
      </div>

      <form onSubmit={inviteParticipant} className='space-y-3'>
        <div className='h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2'>
          <User className='text-zinc-400 size-5'/>
          <input
            name='name'
            placeholder='Nome Completo'
            className='bg-transparent text-lg placeholder-zinc-400 w-40 outline-none flex-1'
          />
        </div>

        <div className='h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2'>
            <Mail className='text-zinc-400 size-5'/>
            <input
              type='email'
              name='email'
              placeholder='E-mail'
              className='bg-transparent text-lg placeholder-zinc-400 w-40 outline-none flex-1'
            />
        </div>

        <Button
          variant='primary'
          size='full'
          type='submit'>
          Confirmar a minha presença
        </Button>
      </form>
    </div>
  </div>
  )
}
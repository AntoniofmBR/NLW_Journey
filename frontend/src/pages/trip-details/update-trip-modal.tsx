import { X, Calendar, MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { DateRange, DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

import { api } from '../../lib/axios';
import { Button } from '../../components/button';

interface UpdateTripModalProps {
  closeUpdateTripModal: () => void
}

export function UpdateTripModal({
  closeUpdateTripModal,
}: UpdateTripModalProps) {

  const { tripId } = useParams()
  const [eventStartAndEndDates, setEventStartAndEndDates] = useState<DateRange | undefined>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  function openDatePicker() {
    return setIsDatePickerOpen(true)
  }

  function closeDatePicker() {
    return setIsDatePickerOpen(false)
  }

  const displayedDate = eventStartAndEndDates && eventStartAndEndDates.from && eventStartAndEndDates.to
  ? format(eventStartAndEndDates.from, "d 'de' LLL").concat(' até ').concat(format(eventStartAndEndDates.to, "d 'de' LLL") )
  : null

  async function updateTripDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const destination = data.get('destination')?.toString()

    if (!destination) {
      return
    }

    if (!eventStartAndEndDates?.from || !eventStartAndEndDates.to) {
      return
    }

    await api.put(`/trips/${tripId}`, {
      destination,
      starts_at: eventStartAndEndDates.from,
      ends_at: eventStartAndEndDates.to,
    })

    window.document.location.reload()
  }

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
    <div className='w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>
              Atualizar local e data da viagem
            </h2>
            <button
            type='button'
            onClick={closeUpdateTripModal}
            >
              <X className='size-5 text-zinc-400'/>
            </button>
            </div>
            <p className='text-sm text-zinc-400'>
              Todos os convidados poderão visualizar que a viagem foi alterada.
            </p>
      </div>

      <form  onSubmit={updateTripDetails} className='space-y-3'>
        <div className='h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2'>
          <MapPin className='text-zinc-400 size-5'/>
          <input
            name='destination'
            placeholder='Qual é o novo destino?'
            className='bg-transparent text-lg placeholder-zinc-400 w-40 outline-none flex-1'
          />
        </div>

        <button 
          type='button'
          onClick={openDatePicker}
          className='h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 w-full'>
            <Calendar className='text-zinc-400 size-5'/>
            <input
              type='text'
              name='occurs_at'
              placeholder={ displayedDate ? displayedDate : 'Data e horário da atividade'}
              className='bg-transparent text-lg placeholder-zinc-400 w-full outline-none flex-1'
            />
        </button>

        <Button
          variant='primary'
          size='full'
          type='submit'>
          Salvar alterações
        </Button>
      </form>
    </div>


    { isDatePickerOpen && (
              <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
              <div className='rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-lg font-semibold'>
                          Selecione a data
                        </h2>
                        <button
                        type='button'
                        onClick={closeDatePicker}
                        >
                          <X className='size-5 text-zinc-400'/>
                        </button>
                      </div>
                  </div>

                  <DayPicker
                   mode='range'
                   selected={eventStartAndEndDates} 
                   onSelect={setEventStartAndEndDates}
                  />
                </div>
            </div>
            ) }
  </div>
  )
}
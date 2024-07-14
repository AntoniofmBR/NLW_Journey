import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { CalendarRange, Info, MapPin, Settings2, Calendar as IconCalendar, User, Mail } from 'lucide-react-native';
import dayjs from 'dayjs';
import { DateData } from 'react-native-calendars';

import { Loading } from '@/components/loading';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Modal } from '@/components/modal';

import { colors } from '@/styles/colors';
import { TripDetails, tripServer } from '@/server/trip-server';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';

import { Activities } from './activities';
import { Details } from './details';
import { validateInput } from '@/utils/validateInput';
import { participantsServer } from '@/server/participants-server';
import { tripStorage } from '@/storage/trip';

export type TripData = TripDetails & { when: string }

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  UPDATE_TRIP = 2,
  CONFIRM_ATTENDANCE = 3, 
}

export default function Trip() {
  const [ isLoadingTrip, setIsLoadingTrip ] = useState(true)
  const [ isUpdatingTrip, setIsUpdatingTrip ] = useState(false)
  const [ isConfirmAttendance, setIsConfirmAttendance ] = useState(false)
  
  const [ tripDetails, setTripDetails ] = useState({} as TripData)
  const [ option, setOption ] = useState< 'activity' | 'details' >('activity')

  const [ showModal, setShowModal ] = useState(MODAL.NONE)
  const [ destination, setDestination ] = useState('')
  const [ selectedDates, setSelectedDates ] = useState({} as DatesSelected)

  const tripParams = useLocalSearchParams<{ id: string, participant?: string }>()

  const [ guestName, setGuestName ] = useState('')
  const [ guestEmail, setGuestEmail ] = useState('')

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true)

      if (!tripParams.id) {
        return router.back()
      }

      const trip = await tripServer.GetById(tripParams.id)

      const maxLengthDestination = 14
      
      const destination = trip.destination.length > maxLengthDestination 
       ? trip.destination.slice(0, maxLengthDestination) + '...'
       : trip.destination

      const starts_at = dayjs(trip.starts_at).format('DD')
      const ends_at = dayjs(trip.ends_at).format('DD')
      const month = dayjs(trip.starts_at).format('MMM')

      setDestination(tripDetails.destination)

      setTripDetails({
        ...trip,
        when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`,
      })

    } catch (err) {
      console.log(err)
    } finally {
      setIsLoadingTrip(false)
    }
  }

  function handleSelectedDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    })

    setSelectedDates(dates)
  }

  async function handleUpdateTrip() {
    try {
      if (!tripParams.id) {
        return
      }

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert(
          'Atualizar viagem',
          '❌ Por favor preencha o destino e as datas de inicio e fim da viagem'
        )
      }

      setIsUpdatingTrip(true)

      await tripServer.update({
        id: tripParams.id,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      })

      Alert.alert(
        'Atualizar viagem',
        '✔️ Viagem atualizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowModal(MODAL.NONE)
              getTripDetails()
            },
          }
        ]
      )

    } catch (err) {
      console.log(err)
    } finally {
      setIsUpdatingTrip(false)
    }
  }

  async function handleConfirmAttendance() {
    try {
      if (!tripParams.participant || !tripParams.id) {
        return
      }

      if (!guestName.trim() || !guestEmail.trim()) {
        return Alert.alert('Confirmação', '❗Por favor preencha todos os campos!')
      }

      if (!validateInput.email(guestEmail.trim())) {
        return Alert.alert('Confirmação', '❌ E-mail inválido!')
      }

      setIsConfirmAttendance(true)

      await participantsServer.confirmTripByParticipantId({
        participantId: tripParams.participant,
        name: guestName,
        email: guestEmail.trim(),
      })

      Alert.alert('Confirmação', '✔️ Presença confirmada com sucesso!')

      await tripStorage.save(tripParams.id)

      setShowModal(MODAL.NONE)

    } catch (err) {
      console.log(err)
      Alert.alert('Confirmação', '❌ Não foi possível confirmar a sua presença!')
    }
  }

  useEffect(() => {
    getTripDetails()
  }, [])

  if (isLoadingTrip) {
    return <Loading />
  }

  return (
    <View className='flex-1 px-5 pt-16' >
      <Input variant='tertiary' >
        <MapPin size={20} color={ colors.zinc['400'] } />
        <Input.Field value={ tripDetails.when } readOnly />

        <TouchableOpacity
          activeOpacity={.7}
          className='w-9 h-9 bg-zinc-800 items-center justify-center rounded' 
          onPress={ () => setShowModal(MODAL.UPDATE_TRIP) }
          >
          <Settings2  size={20} color={ colors.zinc['400'] } />
        </TouchableOpacity>
      </Input>

      { option === 'activity' ? (
        <Activities tripDetails={ tripDetails } />
      ) : (
        <Details tripId={ tripDetails.id } />
      ) }

      <View className='w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950' >
        <View className='w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2' >
          <Button 
          className='flex-1' 
          onPress={ () => setOption('activity') } 
          variant={ option === 'activity' ? 'primary' : 'secondary' }
          >
            <CalendarRange size={20} color={
              option === 'activity' ? colors.lime['950'] : colors.zinc['200']
            }  />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button 
          className='flex-1' 
          onPress={ () => setOption('details') }
          variant={ option === 'details' ? 'primary' : 'secondary' }
          >
            <Info size={20} color={
              option === 'details' ? colors.lime['950'] : colors.zinc['200']
            }  />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>

      </View>

      <Modal
       title='Atualizar viagem'
       subtitle='Somente quem criou a viagem pode atualizar'
       visible={ showModal === MODAL.UPDATE_TRIP }
       onClose={ () => setShowModal(MODAL.NONE) }
       >
        <View className='gap-2 my-4' >
            <Input variant='secondary' >
              <MapPin size={20} color={ colors.zinc['400'] } />
              <Input.Field
                placeholder='Para onde?'
                onChangeText={ setDestination }
                value={ destination }
              />
            </Input>

            <Input variant='secondary' >
              <IconCalendar size={20} color={ colors.zinc['400'] } />
              <Input.Field
                placeholder='Quando?'
                value={ selectedDates.formatDatesInText }
                onPressIn={ () => setShowModal(MODAL.CALENDAR) }
                onFocus={ () => Keyboard.dismiss() }
              />
            </Input>

            <Button onPress={ handleUpdateTrip }  isLoading={ isUpdatingTrip } >
              <Button.Title>Atualizar</Button.Title>
            </Button>
        </View>
      </Modal>

      <Modal
        title='Selecionar datas'
        subtitle='Selecione a data de ida e volta da viagem'
        visible={ showModal === MODAL.CALENDAR }
        onClose={() => { setShowModal(MODAL.NONE) } }
      >
        <View className='gap-4 mt-4'>
          <Calendar
            minDate={ dayjs().toISOString() }
            onDayPress={ handleSelectedDate }
            markedDates={ selectedDates.dates }
          />

          <Button onPress={ () => setShowModal(MODAL.UPDATE_TRIP) }>
              <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title='Confirmar presença'
        visible={ showModal === MODAL.CONFIRM_ATTENDANCE }
      >
        <View className='gap-4 mt-4'>
            <Text className='text-zinc-400 font-regular leading-6 my-2' >
              Você foi convidado(a) para participar de uma viagem para
              <Text className='font-semibold text-zinc-100' >
                {' '}
                { tripDetails.destination }{' '}
              </Text>
              nas datas de
              <Text className='font-semibold text-zinc-100' >
                {' '}
                { dayjs(tripDetails.starts_at).date() }
                {' '} de {' '}
                { dayjs(tripDetails.starts_at).format('MMMM') }
                {' '} a {' '}
                { dayjs(tripDetails.ends_at).date() }
                {' '} de {' '}
                { dayjs(tripDetails.ends_at).format('MMMM') }.
                {'\n\n'}
              </Text>
                Para confirmar a sua presença na viagem, por favor preencha os dados abaixo:
            </Text>

            <Input variant='secondary' >
              <User size={20} color={ colors.zinc['400'] } />
              <Input.Field placeholder='Seu nome completo' onChangeText={ setGuestName } />
            </Input>

            <Input variant='secondary' >
              <Mail size={20} color={ colors.zinc['400'] } />
              <Input.Field placeholder='E-mail de confirmação' onChangeText={ setGuestEmail } />
            </Input>

            <Button isLoading={ isConfirmAttendance } onPress={ handleConfirmAttendance } >
              <Button.Title>Confirmar minha presença</Button.Title>
            </Button>
        </View>
      </Modal>
    </View>
  )
}
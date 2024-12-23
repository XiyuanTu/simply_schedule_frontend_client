import { v4 as uuidv4 } from 'uuid';
import { api } from './api';

export const slotApiSlice = api.injectEndpoints({
  reducerPath: 'slotsApi',
  tagTypes: ['Slots'],
  endpoints: (builder) => ({
    getSlots: builder.query({
      query: ({ studentId, coachId }) => `/slot/${studentId}/${coachId}`,
      transformResponse: (response) =>
        response.map(({ startAt, endAt, status }) => ({
          id: uuidv4(),
          start: startAt,
          end: endAt,
          status,
          isDraggable: false,
        })),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Slots', id })),
              { type: 'Slots', id: 'LIST' },
            ]
          : [{ type: 'Slots', id: 'LIST' }],
    }),
    createSlots: builder.mutation({
      query: ({ studentId, coachId, slots }) => ({
        url: `/slot/${studentId}/${coachId}`,
        method: 'POST',
        body: slots,
      }),
      invalidatesTags: [{ type: 'Slots', id: 'LIST' }],
    }),
    deleteSlots: builder.mutation({
      query: ({ studentId, coachId }) => ({
        url: `/slot/${studentId}/${coachId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Slots', id }],
    }),
  }),
});

export const {
  useGetSlotsQuery,
  useCreateSlotsMutation,
  useDeleteSlotsMutation,
} = slotApiSlice;

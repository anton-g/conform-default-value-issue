import { getCollectionProps, getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { CheckboxField } from '#app/components/forms'

const FormSchema = z.object({
	values: z.array(z.string()),
})

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: FormSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply(), values: [] },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { values } = submission.value

	console.log(values)

	return json({ result: submission.reply(), values })
}

export default function Index() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		constraint: getZodConstraint(FormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: FormSchema })
		},
		shouldRevalidate: 'onBlur',
		defaultValue: {
			values: ['a'],
		},
	})

	return (
		<main className="font-poppins grid h-full place-items-center">
			<Form
				method="POST"
				{...getFormProps(form)}
				className="flex flex-col items-center gap-3"
			>
				<p className="max-w-80">
					Select 'b' in addition to the default 'a' and submit, result should be
					['a', 'b'] but is ['b']
				</p>
				<ol>
					{getCollectionProps(fields.values, {
						type: 'checkbox',
						options: ['a', 'b', 'c'],
					}).map(props => {
						return (
							<li key={props.id}>
								<CheckboxField
									labelProps={{
										htmlFor: props.id,
										children: props.value,
									}}
									buttonProps={props}
								/>
							</li>
						)
					})}
				</ol>
				<button type="submit">submit</button>
				{actionData?.values && (
					<div>
						result: {JSON.stringify(actionData?.values ?? null, null, 2)}
					</div>
				)}
			</Form>
		</main>
	)
}

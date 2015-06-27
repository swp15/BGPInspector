from django import forms

class Query_form(forms.Form):
	protocol = forms.ChoiceField(label="", initial='bgp', choices=[('bgp', 'bgp'), ('pcap', 'pcap')])
	query = forms.CharField(label="", max_length=200, widget=forms.TextInput(attrs={'size':'60'}), required=False)

class Field_filter(forms.Form):
	def __init__(self, field_choices, *args, **kwargs):
		super(Field_filter, self).__init__(*args, **kwargs)
		self.fields['field'].choices = field_choices

	field = forms.ChoiceField(label="", initial=None, choices=('filter'), required=False)


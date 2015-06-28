from django import forms

class Query_form(forms.Form):
	def __init__(self, field_choices, *args, **kwargs):
		super(Query_form, self).__init__(*args, **kwargs)
		if field_choices != None :
			self.fields['field'].choices = field_choices

	protocol = forms.ChoiceField(label="", initial='bgp', choices=[('bgp', 'bgp'), ('pcap', 'pcap')])	
	field = forms.ChoiceField(label="", choices=[], required=False)
	query = forms.CharField(label="", max_length=200, widget=forms.TextInput(attrs={'size':'60'}), required=False)


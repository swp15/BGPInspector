from django import forms

class Query_form(forms.Form):
	def __init__(self, protocol, field_choices, *args, **kwargs):
			super(Query_form, self).__init__(*args, **kwargs)
			if protocol != None:
				self.fields['protocol'].initial = protocol
			if field_choices != None :
				self.fields['field'].choices = field_choices
			
	protocol = forms.ChoiceField(
		label="",
		initial='bgp', 
		widget=forms.Select(attrs={'onchange': 'this.form.submit();'}),
		choices=[('bgp', 'bgp'),('pcap', 'pcap')],
		required=True
	)
		
	field = forms.ChoiceField(	
		label="", 
		choices=[],
		widget=forms.Select(attrs={'onchange': 'this.form.submit();'}), 
		required=False
	)
	query = forms.CharField(
		label="", 
		max_length=200, 
		widget=forms.TextInput(attrs={'size':'60'}), 
		required=False
	)


	

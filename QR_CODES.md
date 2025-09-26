# How to Generate QR Codes for Location Scanning

To create QR codes for various locations in your facility that can be scanned by the ComplaintPro app, follow these steps:

## QR Code Format

The QR codes should contain a JSON object with the following properties:

```json
{
  "class": "101",     // Room or class number
  "floor": "2",       // Floor number
  "department": "Electrical", // Department name
  "building": "A"     // Building identifier (optional)
}
```

## Sample QR Codes

Here are some samples you can generate for testing:

1. **Electrical Room 101**
```json
{"class":"101","floor":"2","department":"Electrical","building":"A"}
```

2. **IT Lab 305**
```json
{"class":"305","floor":"3","department":"IT","building":"B"}
```

3. **Mechanical Room M15**
```json
{"class":"M15","floor":"1","department":"Mechanical","building":"C"}
```

## How to Generate QR Codes

1. Copy the JSON text for the location you want
2. Go to an online QR code generator like:
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QR Code Monkey](https://www.qrcode-monkey.com/)
   - Any other QR code generator site
3. Paste the JSON text into the content field
4. Generate the QR code
5. Download and print the QR code
6. Post the QR code at the corresponding location

## Implementation Details

When scanned, these QR codes will automatically fill in the complaint form with:
- Location (Building and Floor)
- Place (Department and Room)
- Class, Floor, and Department fields

This makes it easy for users to submit complaints about specific locations without having to manually enter the details.
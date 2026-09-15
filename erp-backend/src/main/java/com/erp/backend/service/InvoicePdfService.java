package com.erp.backend.service;

import com.erp.backend.model.Invoice;
import com.erp.backend.model.SalesOrderItem;
import com.erp.backend.repository.InvoiceRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    public InvoicePdfService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public byte[] generateInvoicePdf(Long invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found with id: " + invoiceId
                        )
                );

        try {
            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4);

            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = new Font(
                    Font.HELVETICA,
                    20,
                    Font.BOLD
            );

            Font headingFont = new Font(
                    Font.HELVETICA,
                    12,
                    Font.BOLD
            );

            // Title
            Paragraph title =
                    new Paragraph("INVOICE", titleFont);

            title.setAlignment(Element.ALIGN_CENTER);

            document.add(title);

            document.add(
                    new Paragraph(" ")
            );

            // Invoice details
            document.add(
                    new Paragraph(
                            "Invoice Number: "
                                    + invoice.getInvoiceNumber()
                    )
            );

            document.add(
                    new Paragraph(
                            "Invoice Date: "
                                    + invoice.getInvoiceDate()
                    )
            );

            document.add(
                    new Paragraph(
                            "Status: "
                                    + invoice.getStatus()
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // Customer details
            document.add(
                    new Paragraph(
                            "Customer Details",
                            headingFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Name: "
                                    + invoice.getCustomer().getName()
                    )
            );

            document.add(
                    new Paragraph(
                            "Email: "
                                    + invoice.getCustomer().getEmail()
                    )
            );

            document.add(
                    new Paragraph(
                            "Phone: "
                                    + invoice.getCustomer().getPhone()
                    )
            );

            document.add(
                    new Paragraph(
                            "Address: "
                                    + invoice.getCustomer().getAddress()
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // Items table
            PdfPTable table = new PdfPTable(5);

            table.setWidthPercentage(100);

            table.setWidths(
                    new float[]{1, 3, 1, 2, 2}
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase("No.")
                    )
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase("Product")
                    )
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase("Qty")
                    )
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase("Unit Price")
                    )
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase("Total")
                    )
            );

            int itemNumber = 1;

            for (SalesOrderItem item :
                    invoice.getSalesOrder().getItems()) {

                table.addCell(
                        String.valueOf(itemNumber++)
                );

                table.addCell(
                        item.getProduct().getName()
                );

                table.addCell(
                        String.valueOf(item.getQuantity())
                );

                table.addCell(
                        String.valueOf(item.getUnitPrice())
                );

                table.addCell(
                        String.valueOf(item.getTotalPrice())
                );
            }

            document.add(table);

            document.add(
                    new Paragraph(" ")
            );

            // Amount summary
            document.add(
                    new Paragraph(
                            "Sales Amount: ₹"
                                    + invoice.getSalesOrder()
                                    .getTotalAmount()
                    )
            );

            document.add(
                    new Paragraph(
                            "GST: ₹"
                                    + invoice.getTax()
                    )
            );

            Paragraph total =
                    new Paragraph(
                            "TOTAL PAYABLE: ₹"
                                    + invoice.getTotalPayable(),
                            headingFont
                    );

            total.setAlignment(Element.ALIGN_RIGHT);

            document.add(total);

            document.add(
                    new Paragraph(" ")
            );

            Paragraph footer =
                    new Paragraph(
                            "Thank you for your business!"
                    );

            footer.setAlignment(Element.ALIGN_CENTER);

            document.add(footer);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate invoice PDF",
                    e
            );
        }
    }
}